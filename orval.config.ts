module.exports = {
    'Iskorka-file': {
      mode: 'split',
      input: './swagger.yaml',
      output: {
        target: 'src/api/iskorka.ts',
        schemas: 'src/api/model',
        client: 'react-query',
        mock: true,
      }
    },
  };