# ZNTR

ZNTR is a game framework written in ES6.

The goal is to provide the following features:
* Pluggable TCP server easy to maintain
* Default TCP protocol which can be easily overriden
* RPC system, allowing a client to call methods located on the server
* Event system, allowing to send event from the server to the clients
* Messaging system between the clients
* Easily scalable (add more servers, and it just works)
* Reliable (if one server is lost, the game should not be perturbed)
* Lobby/Room system, allowing people playing together to be on the same server

## Dependencies

As it's written in ES6, it requires at least Node.js v5.

