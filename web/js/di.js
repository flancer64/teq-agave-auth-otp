/**
 * Common ES6 module for setting up a DI container and initializing an application factory.
 */
import Container from '/src/@teqfw/di/Container.js';

/** @type {TeqFw_Di_Container} */
const container = new Container();

// Configure the resolver for handling dependencies by namespace.
const resolver = container.getResolver();
resolver.addNamespaceRoot('Fl64_Auth_Otp_', '/src/@flancer64/teq-agave-auth-otp');
resolver.addNamespaceRoot('TeqFw_Core_', '/src/@teqfw/core', 'mjs');
resolver.addNamespaceRoot('TeqFw_Di_', '/src/@teqfw/di', 'js');
resolver.addNamespaceRoot('TeqFw_Web_', '/src/@teqfw/web', 'mjs');

export default container;
