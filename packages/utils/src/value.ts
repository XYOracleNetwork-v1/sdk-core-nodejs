export class CurrentValue<T> {
  private currentValue: null|T = null

  public setCurrentValue (value: T) {
    this.currentValue = value
  }

  public getCurrentValue () {
    return this.currentValue
  }

  public async awaitCurrentValue () {
    return this.currentValue
  }
}
