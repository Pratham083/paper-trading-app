export function formatNumber(value) {
  if (value == null || isNaN(value)) {
    return "0.00";
  }
  return Number(value).toFixed(2);
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