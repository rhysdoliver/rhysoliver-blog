const ordinal = (day: number) => {
  if (day > 3 && day < 21) return "th"
  switch (day % 10) {
    case 1:
      return "st"
    case 2:
      return "nd"
    case 3:
      return "rd"
    default:
      return "th"
  }
}

// Matches the original site's "dddd Do MMMM YYYY" format, e.g. "Thursday 1st October 2020".
export const formatDate = (date: Date) => {
  const weekday = date.toLocaleDateString("en-GB", { weekday: "long" })
  const month = date.toLocaleDateString("en-GB", { month: "long" })
  const day = date.getDate()
  const year = date.getFullYear()
  return `${weekday} ${day}${ordinal(day)} ${month} ${year}`
}
