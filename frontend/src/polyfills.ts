/***************************************************************************************************
 * BROWSER POLYFILLS
 */

/** Fix for STOMP.js / SockJS / crypto issues in Angular */
(window as any).global = window;

/***************************************************************************************************
 * Zone JS is required by Angular itself
 */
import 'zone.js'; // Included with Angular CLI.

/***************************************************************************************************
 * APPLICATION IMPORTS
 *
 * Add your custom polyfills here if needed.
 */
