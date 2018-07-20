const js2xmlparser = require('js2xmlparser')

let request = {
  '@': {COR: 'Sabre', VER: '1.0'},
  BIL: {
    '@': {AAA: '61N1', AKD: 'S',CSV: 'MMODAL', PID: 'AA', TXN: 123, UCD: '61N1'}
  },
  SEG: {
    '@': {SMN: 2, SMX: 2}
  },
  MMS: {
    ODM: {
      '@': {BRD: 'LON', OFF:"KRK", BTP:"C", OTP:"C"}
    },
    DTM: {
      '@': {TGD: '2018-08-01'}
    },
    CTM: {
      '@': {CNC: 0, CNA: 1439}
    },
    OTM: {
      '@': {RGT: false}
    }
  }
}

const RQData = {
  body: {
    request: js2xmlparser.parse("DSS", request),
    connectionPrefix: 'tcpip.',
    stylesheet: 'results-raw.xsl',
    'namingConnection.type': 'com.sabre.atse.dss.communication.DssNamingConnectionDescriptor',
    'namingConnection.invokerClassName': 'com.sabre.atse.dss.communication.DssInvoker',
    serverName: 'ABHIJIT',
    'namingConnection.nameServerHost': 'directorycrt.sabre.com',
    'namingConnection.nameServerPort': 27000,
    'namingConnection.namingContext': 'Shared/IDL:SDM_PUBLIC\/SDM_request:1\.0.IDL/Common.dev/SDMPublic\/ABHIJIT',
    'namingConnection.interface': 'idl',
    'namingConnection.methodName': 'getSchedsAvailDiag',
    'iorConnection.type': 'com.sabre.atse.dss.communication.DssIORConnectionDescriptor',
    'iorConnection.invokerClassName': 'com.sabre.atse.dss.communication.DssInvoker',
    'iorConnection.interface': 'idl',
    'iorConnection.methodName': 'getSchedsAvailDiag',
    'tcpip.type': 'com.sabre.xmlconnection.tcpip.TCPIPConnectionDescriptor',
    'tcpip.serverName': 'dss.v2.cert.ha.sabre.com',
    'tcpip.port': 54201,
    'tcpip.socketTimeout': 15000,
    submit: 'Send Request'
  },
  getheaders: oneLinedStringLength => {
    return {
      'Host': 'utt.cert.sabre.com',
      'Connection': 'keep-alive',
      'Content-Length': oneLinedStringLength,
      'Pragma': 'no-cache',
      'Cache-Control': 'no-cache',
      'Origin': 'http//utt.cert.sabre.com',
      'Upgrade-Insecure-Requests': 1,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }
}

module.exports = RQData