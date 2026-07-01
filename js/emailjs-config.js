/* ============================================================
   HERMANDAD DEL BARRIO | MEDINA SIDONIA
   Configuración de EmailJS — envío real del formulario
   "Hazte Hermano" a la Secretaría
   ============================================================

   ╔══════════════════════════════════════════════════════════════╗
   ║  PASOS PARA ACTIVAR EL ENVÍO DE CORREOS                      ║
   ║                                                                ║
   ║  1. Crea una cuenta gratuita en https://www.emailjs.com      ║
   ║  2. Email Services → conecta tu cuenta de correo (Gmail,      ║
   ║     Outlook…) → copia el Service ID.                          ║
   ║  3. Email Templates → crea una plantilla con estas variables  ║
   ║     exactas (deben coincidir con el atributo "name" de cada   ║
   ║     campo del formulario en index.html):                      ║
   ║       {{nombre}}  {{apellidos}}  {{dni}}                      ║
   ║       {{fecha_nacimiento}}  {{telefono}}  {{email}}            ║
   ║       {{direccion}}  {{como_conocio}}  {{mensaje}}             ║
   ║     Copia el Template ID.                                     ║
   ║  4. Account → General → copia tu Public Key.                  ║
   ║  5. Sustituye los tres valores de abajo y elimina este        ║
   ║     bloque de comentario.                                     ║
   ╚══════════════════════════════════════════════════════════════╝
*/

const EMAILJS_PUBLIC_KEY  = "TU_PUBLIC_KEY";
const EMAILJS_SERVICE_ID  = "TU_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "TU_TEMPLATE_ID";

if (typeof emailjs !== 'undefined') {
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
}
