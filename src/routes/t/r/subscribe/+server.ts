import { createObserver } from '$lib/server/gameRound'
import { stringify } from 'devalue'
import debug from 'debug'
import { finalize, type Observable, type Subscription } from 'rxjs'
import type { RequestEvent } from './$types'
import type { VisibleState } from '$lib/cards'

const dlog = debug('subscribe')

import { setTableRoundKey, table_round_key, type TableRoundKey } from '$lib/table_round_key'
let tableRoundKey: TableRoundKey;
table_round_key.subscribe((value) => {
    tableRoundKey = value;
})

export function GET(ev: RequestEvent): Response {
    const { tableId, round } = tableRoundKey
    const roundObservable: Observable<VisibleState> = createObserver(tableId, round);

    let subscription: Subscription;
    const stream = new ReadableStream({
        start(controller: ReadableStreamDefaultController<string>): void {
            subscription = roundObservable
                .pipe(finalize(() => {
                    console.log('finalize')
                    setTableRoundKey(tableId, round + 1);
                }))
                .subscribe({
                    next(value: VisibleState): void {
                        const eventText = `event: message\ndata: ${stringify(value)}\n\n`
                        dlog('eventText', eventText)
                        controller.enqueue(eventText)
                    },
                    error(error: Error): void {
                        console.error('error', error)
                        controller.error(error)
                    },
                    complete(): void {
                        dlog('complete')
                        controller.close()
                    }
                })
        },
        cancel(): void {
            subscription.unsubscribe()
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        }
    })
}
