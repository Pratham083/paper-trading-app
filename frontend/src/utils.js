export function formatNumber(num, largeNum=false) {
  if (num == null || isNaN(num)) {
    return "-";
  }
  if(!largeNum) {
    return Number(num).toFixed(2);
  } else {
    const absNum = Math.abs(num);
    if (absNum >= 1e12) return (num/1e12).toFixed(2) +"T";
    if (absNum >= 1e9)  return (num/1e9).toFixed(2) +"B";
    if (absNum >= 1e6)  return (num/1e6).toFixed(2) +"M";
    if (absNum >= 1e3)  return (num /1e3).toFixed(2) +"K";
    return Number(num).toFixed(2);
  }
}

//marshmallow errors come in objects so need to format
export function formatMarshmallowError(data) {
  if (data && typeof data === 'object') {
    const messages = [];

    for (const [field, value] of Object.entries(data)) {
      const cleanField = field.charAt(0).toUpperCase() + field.slice(1);

      if (Array.isArray(value)) {
        messages.push(`${cleanField}: ${value.join(", ")}`);
      } else if (typeof value === "string") {
        messages.push(`${cleanField}: ${value}`);
      }
    }
    return messages.join("\n");
  } 
  else if(data && typeof data === "string") {
    return data;
  }
  else {
    return 'Unknown error'
  }
}