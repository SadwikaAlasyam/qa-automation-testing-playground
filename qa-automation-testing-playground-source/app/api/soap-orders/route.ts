import { NextRequest, NextResponse } from "next/server";

const envelope = (body: string) => `<?xml version="1.0" encoding="UTF-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ord="https://orderflow.example/orders"><soap:Body>${body}</soap:Body></soap:Envelope>`;

export async function GET() {
  return new NextResponse(`<?xml version="1.0"?><definitions name="OrderService" targetNamespace="https://orderflow.example/orders"><service name="OrderService"><documentation>OrderFlow SOAP practice service</documentation></service></definitions>`, { headers: { "content-type": "application/wsdl+xml" } });
}

export async function POST(request: NextRequest) {
  const xml = await request.text();
  const action = request.headers.get("soapaction");
  if (!xml.includes("Envelope") || !action) {
    return new NextResponse(envelope(`<soap:Fault><faultcode>soap:Client</faultcode><faultstring>SOAPAction and valid Envelope are required</faultstring></soap:Fault>`), { status: 500, headers: { "content-type": "text/xml" } });
  }
  if (xml.includes("FAULT-ORDER")) {
    return new NextResponse(envelope(`<soap:Fault><faultcode>ord:OrderNotFound</faultcode><faultstring>Requested order does not exist</faultstring></soap:Fault>`), { status: 500, headers: { "content-type": "text/xml" } });
  }
  return new NextResponse(envelope(`<ord:GetOrderResponse><ord:id>ADV-2048</ord:id><ord:status>Ready</ord:status><ord:total>59.96</ord:total></ord:GetOrderResponse>`), { headers: { "content-type": "text/xml", "X-Schema-Version": "1.0" } });
}
