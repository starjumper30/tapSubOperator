import {Observable, MonoTypeOperatorFunction, Subscriber, Operator, TeardownLogic} from 'rxjs';

export function tapSub<T>(subCB: () => void, unsubCB: () => void): MonoTypeOperatorFunction<T> {
  return function tapOperatorFunction(source: Observable<T>): Observable<T> {
    return source.lift(new DoOperator(subCB, unsubCB));
  };
}

class DoOperator<T> implements Operator<T, T> {
  constructor(private subCB: () => void, private unsubCB: () => void) {
  }
  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new DoSubscriber(subscriber, this.subCB, this.unsubCB));
  }
}

class DoSubscriber<T> extends Subscriber<T> {

  constructor(destination: Subscriber<T>,
              private subCB: () => void,
              private unsubCB: () => void) {
    super(destination);
    subCB();
  }

  unsubscribe(): void {
    super.unsubscribe();
    this.unsubCB();
  }
}
