import { lastValueFrom, interval, Subject, Observable } from 'rxjs';
import {
    catchError,
    take,
    skip,
    first,
    toArray,
}                       from 'rxjs/operators';

test('Pure observable', async () => {
    const source = interval(100);
    const result = await lastValueFrom(source
        .pipe(
            take(2),
            toArray()));
    expect(result).toEqual([0, 1]);
});

test('Observable (with observer.next)', async () => {
    const every_second = new Observable((observer) => {
        observer.next(0);
        observer.next(1);
        observer.complete();
    });
    const array        = await lastValueFrom(every_second
        .pipe(
            take(2),
            toArray()));

    expect(array).toEqual([0, 1]);
});

test('Subject (with source.next)', async () => {
    const every_second = new Subject();

    let counter = 0;
    setInterval(() => every_second.next(counter++), 100);

    const array = await lastValueFrom(every_second
        .pipe(
            take(2),
            toArray()));

    expect(array).toEqual([0, 1]);
});

test('Observable throwing error', async () => {
    const error_source = new Subject();

    error_source.pipe(catchError(e => expect(e).toBeInstanceOf(Error)));

    const promise = lastValueFrom(error_source);

    error_source.error(Error('Oops, err...'));

    expect(promise).rejects.toBeInstanceOf(Error);
});

test('Subject with skip', async () => {
    const source = new Subject();

    let counter = 0;
    setInterval(() => source.next(counter++), 100);

    const with_skip = source.pipe(skip(1));

    const items = await lastValueFrom(with_skip.pipe(take(2), toArray()));

    // source is a Subject which by default is a hot observable
    const items_after_await = await lastValueFrom(source.pipe(first()));

    expect(items).toEqual([1, 2]);

    expect(items_after_await).toEqual(3);
});
