const htmlToJsonParser = require('himalaya').parse
const RQData = require('./services/requestData.service')
const jsHelper = require('./services/jsHelper.service')

jsHelper.argumentsValidation(process.argv, (err) => {
  if (!err) {
    RQData.getTransferAirport(process.argv[2], process.argv[3], process.argv[4], (err, data) => {
      if (err) throw new Error(err)
      console.log('data====================================');
      console.log(data);
      console.log('data====================================');
    })
  }
})