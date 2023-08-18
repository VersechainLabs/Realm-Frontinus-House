export function updateValidFields(
  originObj: any,
  updateObj: any,
  updateKeys: string[],
) {
  const keys = Object.keys(updateObj).filter((key) => updateKeys.includes(key));
  Object.assign(originObj, ...keys.map((key) => ({ [key]: updateObj[key] })));
}