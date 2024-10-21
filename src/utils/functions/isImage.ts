export function isImage(ext: any) {
  const reg = /(\jpg|\jpeg|\png|\gif|\webp)$/i
  return reg.test(ext)
}
