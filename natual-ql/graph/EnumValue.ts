export class EnumValue {
  private value: string

  constructor(value: string) {
    this.value = value
  }

  public toString(): string {
    return this.value
  }
}

export function enumValue(value: string): EnumValue {
  return new EnumValue(value);
}