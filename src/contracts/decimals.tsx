export function calGas (amount, unit) {
  let expr = 0
  switch(unit) {
    case 'btm':
      expr = 8
      break
    case 'mbtm':
      expr = 5
      break
    case 'neu':
      expr = 0
  }
  return Math.floor(Number(amount) * Math.pow(10, expr))
}