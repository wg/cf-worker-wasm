use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
struct Error {
    cause: String,
}

#[wasm_bindgen]
pub fn greet(name: String) -> Result<String, JsValue> {
    let name = name.trim();
    match name.is_empty() {
        false => Ok(format!("hello, {}", name)),
        true  => Err(Error::new("missing name").into()),
    }
}

impl Error {
    fn new(cause: &str) -> Self {
        Self { cause: cause.into() }
    }
}

impl From<Error> for JsValue {
    fn from(error: Error) -> Self {
        Self::from_serde(&error).unwrap()
    }
}
