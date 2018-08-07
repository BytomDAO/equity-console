export const strToHexCharCode = (str) => {
    if (str === "")
      return ""
    var hexCharCode: string[] = []
    for (var i = 0; i < str.length; i++) {
      hexCharCode.push((str.charCodeAt(i)).toString(16))
    }
    return hexCharCode.join("")
}