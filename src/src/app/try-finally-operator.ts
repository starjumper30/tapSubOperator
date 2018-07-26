import {Observable, MonoTypeOperatorFunction, Subscriber, Operator, TeardownLogic} from 'rxjs';

export function tryFinally<T> (onSubscribe: () => void, finallyCB: () => void): MonoTypeOperatorFunction<T> {
  return function tapOperatorFunction(source: Observable<T>): Observable<T> {
    return source.lift(new TryFinallyOperator (onSubscribe, finallyCB));
  };
}

class TryFinallyOperator<T> implements Operator<T, T> {
  constructor(private onSubscribe, private finallyCB) {
  }
  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new TryFinallySubscriber(subscriber, this.onSubscribe, this.finallyCB));
  }
}

class TryFinallySubscriber<T> extends Subscriber<T> {
  private finallyCalled = false;

  constructor(destination: Subscriber<T>,
              private onSubscribe,
              private finallyCB) {
    super(destination);
    onSubscribe();
  }

  unsubscribe(): void {
    super.unsubscribe();
    if (!this.finallyCalled) { // unsubscribe can get called multiple times
      this.finallyCalled = true;
      this.finallyCB();
    }
  }
}
