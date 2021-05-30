export const responseError = (message: string, statusCode: number = 500): any => {
  return {
    statusCode,
    body: JSON.stringify({
      message,
    }),
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const responseSuccess = (data: any, statusCode: number = 200): any => {
  return {
    statusCode,
    body: JSON.stringify(data),
  }
}
