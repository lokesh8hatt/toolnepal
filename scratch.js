const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`);
const window = dom.window;
const document = window.document;

// We need to polyfill some things for JsBarcode
global.window = window;
global.document = document;
const JsBarcode = require("jsbarcode");

const tempSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

try {
  JsBarcode(tempSvg, "TOOLNEPAL123", {
    format: "CODE128",
    width: 2,
    height: 100,
    displayValue: true
  });
  
  console.log("SVG outerHTML:", tempSvg.outerHTML);
  console.log("Width attribute:", tempSvg.getAttribute("width"));
  console.log("Height attribute:", tempSvg.getAttribute("height"));
} catch (e) {
  console.error("Error:", e);
}
