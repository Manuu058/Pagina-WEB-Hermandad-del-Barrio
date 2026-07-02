const EMAILJS_PUBLIC_KEY  = "TpC7hHdcDyu-fSx-Y";
const EMAILJS_SERVICE_ID  = "service_fqz4a38";
const EMAILJS_TEMPLATE_ID = "template_e6ds6bs";

if (typeof emailjs !== 'undefined') {
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
}
