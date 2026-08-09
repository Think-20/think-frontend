import { AbstractControl } from "@angular/forms";
import { Client } from "../clients/client.model";

export function ObjectValidator(control: AbstractControl): { [key: string]: boolean } | null {
  const value = control.value

  if ((value.id == undefined && value != '')) {
    return { 'validClient': true }
  }

  return null
}

function onlyDigits(value: any): string {
  return String(value || '').replace(/[^0-9]/g, '')
}

function calcDigit(cnpj: string, position: number): string {
  let digits = cnpj.substr(0, 12 + (position - 5))
  let total = 0
  let mod = 0

  for (let i = 0; i < digits.length; i++) {
    total += parseInt(digits[i], 10) * position
    position--

    if (position < 2) {
      position = 9
    }
  }

  mod = Math.round(total % 11)
  return mod < 2 ? '0' : (11 - mod).toString()
}

function calcCpfDigit(cpf: string, factor: number): string {
  let total = 0

  for (let i = 0; i < factor - 1; i++) {
    total += parseInt(cpf.charAt(i), 10) * (factor - i)
  }

  const rest = total % 11
  return rest < 2 ? '0' : String(11 - rest)
}

function isValidLuhn(value: string): boolean {
  let sum = 0
  let shouldDouble = false

  for (let i = value.length - 1; i >= 0; i--) {
    let digit = parseInt(value.charAt(i), 10)
    if (shouldDouble) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    sum += digit
    shouldDouble = !shouldDouble
  }

  return sum % 10 === 0
}

export function CnpjValidator(control: AbstractControl): { [key: string]: boolean } | null {
  const value = onlyDigits(control.value)

  if (value.length !== 14) {
    return { 'validCnpj': true }
  }

  if (calcDigit(value, 5) !== value.charAt(12) || calcDigit(value, 6) !== value.charAt(13)) {
    return { 'validCnpj': true }
  }

  return null
}

export function CpfCnpjValidator(control: AbstractControl): { [key: string]: boolean } | null {
  const value = onlyDigits(control.value)

  if (value.length === 11) {
    if (/^([0-9])\1+$/.test(value)) {
      return { 'validCpfCnpj': true }
    }

    const firstDigit = calcCpfDigit(value, 10)
    const secondDigit = calcCpfDigit(value, 11)

    if (firstDigit !== value.charAt(9) || secondDigit !== value.charAt(10)) {
      return { 'validCpfCnpj': true }
    }

    return null
  }

  if (value.length === 14) {
    if (/^([0-9])\1+$/.test(value)) {
      return { 'validCpfCnpj': true }
    }

    if (calcDigit(value, 5) !== value.charAt(12) || calcDigit(value, 6) !== value.charAt(13)) {
      return { 'validCpfCnpj': true }
    }

    return null
  }

  return { 'validCpfCnpj': true }
}

export function CepValidator(control: AbstractControl): { [key: string]: boolean } | null {
  const value = onlyDigits(control.value)

  if (value.length !== 8) {
    return { 'validCep': true }
  }

  return null
}

export function PhoneValidator(control: AbstractControl): { [key: string]: boolean } | null {
  const value = onlyDigits(control.value)

  if (value.length !== 10 && value.length !== 11) {
    return { 'validPhone': true }
  }

  return null
}

export function OptionalPhoneValidator(control: AbstractControl): { [key: string]: boolean } | null {
  const value = onlyDigits(control.value)

  if (value.length === 0) {
    return null
  }

  if (value.length !== 10 && value.length !== 11) {
    return { 'validPhone': true }
  }

  return null
}

export function OptionalCepValidator(control: AbstractControl): { [key: string]: boolean } | null {
  const value = onlyDigits(control.value)

  if (value.length === 0) {
    return null
  }

  if (value.length !== 8) {
    return { 'validCep': true }
  }

  return null
}

export function BankAccountNumberValidator(control: AbstractControl): { [key: string]: boolean } | null {
  const value = onlyDigits(control.value)

  if (value.length < 4 || value.length > 20) {
    return { 'validBankAccount': true }
  }

  return null
}

export function BankAccountDigitValidator(control: AbstractControl): { [key: string]: boolean } | null {
  const value = onlyDigits(control.value)

  if (value.length < 1 || value.length > 2) {
    return { 'validBankAccountDigit': true }
  }

  return null
}

export function CreditCardNumberValidator(control: AbstractControl): { [key: string]: boolean } | null {
  const value = onlyDigits(control.value)

  if (value.length < 13 || value.length > 19) {
    return { 'validCreditCard': true }
  }

  if (!isValidLuhn(value)) {
    return { 'validCreditCard': true }
  }

  return null
}

export function CreditCardDigitValidator(control: AbstractControl): { [key: string]: boolean } | null {
  const value = onlyDigits(control.value)

  if (value.length < 3 || value.length > 4) {
    return { 'validCreditCardDigit': true }
  }

  return null
}

export function EmailValidator(control: AbstractControl): { [key: string]: boolean } | null {
  const value = String(control.value || '')

  if (value === '') {
    return { 'validEmail': true }
  }

  const emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/

  if (!emailRegex.test(value)) {
    return { 'validEmail': true }
  }

  return null
}

export function OptionalEmailValidator(control: AbstractControl): { [key: string]: boolean } | null {
  const value = String(control.value || '').trim()

  if (value === '') {
    return null
  }

  const emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/

  if (!emailRegex.test(value)) {
    return { 'validEmail': true }
  }

  return null
}
