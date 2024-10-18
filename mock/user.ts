export default [
  {
    url: '/api/user',
    method: 'post',
    response: () => {
      return {
        code: 0,
        data: {
          user_id: '1234',
          auth: false,
          token: 'xxx',
        },
      }
    },
  },
]
