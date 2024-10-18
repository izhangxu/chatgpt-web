export default [
  {
    url: '/api/chat-process',
    method: 'post',
    response: () => {
      return {
        code: 0,
        data: {
          text: '12312312312313212312313123',
        },
      }
    },
  },
]
