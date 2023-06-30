# UI updates

1. The client page is `/t/[tableId]/r/[roundId]`
    It is just a SSR rendered view of the table's visible state.
    The user can click a card in the tray, which generates a POST
    that will be handled by the server `/t/[tableId]/r/[roundId]/+page.server.ts`

2. When it is not the user's turn the UI needs to be able to receive
    server-sent events (SSEs).
    The SSEs will send a VisibleState json object.
    The VisibleState contains all of the information necessary to
    correctly render the static page.

The web client doesn't need to know the details of the VisibleState.
All it needs is the static (prerendered) html page, where each of the cards
in the tray has necessary CSS classes to indicate whether the card should be
visibly "selected" and whether the card is clickable.

The cards in the Trick are not clickable, not selected, but not disabled.
The legal play cards in the Tray are clickable and not disabled.
The non-legal play cards in the Tray are not clickable and disabled.

"disabled" means the card's appearance is dimmed/modified so that it is clear
that they are not clickable.

clickable cards respond to hover. non-clickable cards do not respond to hover.


## Outline of implementation:

1. Don't use `+page.server.svelte`
2. Instead use a `server.ts` file that implements:
    * `GET` method that returns a Reponse(ReadableStream)
    * `POST` method that responds to card clicks
    * helper functions:
        1. sendVisibleState -- enqueue's a VisibleState message
        2. functions to get and update the Round record
