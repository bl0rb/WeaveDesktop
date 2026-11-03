//! macOS autostart as a real login item: `SMAppService.mainApp` registers
//! Weave.app itself, so System Settings lists it with the app's icon. The
//! LaunchAgent of tauri-plugin-autostart points at the bare executable inside
//! the bundle and shows up as a generic "exec" icon instead.
//! A login item gets no command-line arguments; the launch Apple Event tells
//! whether macOS started Weave at login.

use objc2::msg_send;
use objc2::rc::Retained;
use objc2::runtime::{AnyClass, AnyObject, Bool};
use std::ffi::{c_char, CStr};
use std::ptr;

#[link(name = "ServiceManagement", kind = "framework")]
extern "C" {}

/// `SMAppServiceStatusEnabled`.
const STATUS_ENABLED: isize = 1;

fn four_cc(code: &[u8; 4]) -> u32 {
    u32::from_be_bytes(*code)
}

fn main_app_service() -> Result<Retained<AnyObject>, String> {
    let class = AnyClass::get(c"SMAppService").ok_or("SMAppService ist nicht verfügbar.")?;
    let service: Option<Retained<AnyObject>> = unsafe { msg_send![class, mainAppService] };
    service.ok_or_else(|| "SMAppService ist nicht verfügbar.".into())
}

pub fn is_enabled() -> bool {
    main_app_service().is_ok_and(|service| {
        let status: isize = unsafe { msg_send![&*service, status] };
        status == STATUS_ENABLED
    })
}

pub fn set_enabled(enabled: bool) -> Result<(), String> {
    let service = main_app_service()?;
    let mut error: *mut AnyObject = ptr::null_mut();
    let ok: Bool = unsafe {
        if enabled {
            msg_send![&*service, registerAndReturnError: &mut error as *mut *mut AnyObject]
        } else {
            msg_send![&*service, unregisterAndReturnError: &mut error as *mut *mut AnyObject]
        }
    };
    if ok.as_bool() {
        return Ok(());
    }
    Err(describe(error).unwrap_or_else(|| "Autostart konnte nicht geändert werden.".into()))
}

fn describe(error: *mut AnyObject) -> Option<String> {
    let error = unsafe { error.as_ref() }?;
    let text: Option<Retained<AnyObject>> = unsafe { msg_send![error, localizedDescription] };
    let utf8: *const c_char = unsafe { msg_send![&*text?, UTF8String] };
    (!utf8.is_null()).then(|| unsafe { CStr::from_ptr(utf8) }.to_string_lossy().into_owned())
}

/// True when macOS opened Weave as a login item. Valid only while the launch
/// event is handled, i.e. during the app's setup (didFinishLaunching).
pub fn launched_at_login() -> bool {
    let Some(class) = AnyClass::get(c"NSAppleEventManager") else { return false };
    unsafe {
        let manager: Option<Retained<AnyObject>> = msg_send![class, sharedAppleEventManager];
        let Some(manager) = manager else { return false };
        let event: Option<Retained<AnyObject>> = msg_send![&*manager, currentAppleEvent];
        let Some(event) = event else { return false };
        let id: u32 = msg_send![&*event, eventID];
        if id != four_cc(b"oapp") {
            return false;
        }
        let property: Option<Retained<AnyObject>> = msg_send![&*event, paramDescriptorForKeyword: four_cc(b"prdt")];
        let Some(property) = property else { return false };
        let code: u32 = msg_send![&*property, enumCodeValue];
        code == four_cc(b"lgit")
    }
}
