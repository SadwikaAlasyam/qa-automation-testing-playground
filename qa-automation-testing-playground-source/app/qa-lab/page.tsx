"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

function ShadowOrderWidget() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!host.current || host.current.shadowRoot) return;
    const root = host.current.attachShadow({ mode: "open" });
    root.innerHTML = `<style>section{font:14px Arial;background:#111814;color:white;padding:18px}button{background:#d9ff57;border:0;padding:10px;font-weight:800}</style><section data-testid="shadow-root-content"><p>Status: <strong id="shadow-status">Unverified</strong></p><button id="shadow-verify">Verify order</button></section>`;
    root.getElementById("shadow-verify")?.addEventListener("click", () => { const status = root.getElementById("shadow-status"); if (status) status.textContent = "Verified"; });
  }, []);
  return <div ref={host} data-testid="shadow-host" />;
}

const cases = [
  { id: "TC-01", scenario: 1, title: "Cart calculation", skill: "Boundary values + assertions", objective: "Verify quantity, discount, tax, and final total calculations.", expected: "SAVE10 reduces the subtotal by 10% and the displayed total matches the calculation." },
  { id: "TC-02", scenario: 1, title: "Checkout validation", skill: "Form validation + popup", objective: "Validate required shipping details and complete checkout.", expected: "Invalid data is blocked; valid data opens an order confirmation popup." },
  { id: "TC-03", scenario: 3, title: "Order tracking", skill: "Async waits + state transitions", objective: "Observe a realistic delayed order-status workflow.", expected: "The order changes from Processing to Packed to Shipped in the correct sequence." },
  { id: "TC-04", scenario: 2, title: "Payment iframe", skill: "Frame handling + isolated DOM", objective: "Enter test card data inside an embedded payment widget.", expected: "The iframe accepts the test card and shows Payment authorized." },
  { id: "TC-05", scenario: 1, title: "Locator strategies", skill: "ID + role + text", objective: "Locate customer and order controls using stable semantic strategies.", expected: "All targets are found without brittle CSS." },
  { id: "TC-06", scenario: 2, title: "Payment decisions", skill: "Alert + confirm + prompt", objective: "Handle approval, cancellation, and reviewer dialogs.", expected: "Each payment decision returns the correct dialog result." },
  { id: "TC-07", scenario: 3, title: "Warehouse frames", skill: "Iframe inside iframe", objective: "Move from fulfillment into the embedded inventory system.", expected: "The inner inventory frame reserves one unit." },
  { id: "TC-08", scenario: 3, title: "Dynamic fulfillment", skill: "Visibility + DOM changes", objective: "Wait for a conditionally generated fulfillment token.", expected: "The token appears only after the warehouse action." },
  { id: "TC-09", scenario: 1, title: "Order preferences", skill: "Range + radio + select", objective: "Configure coverage, browser, and test-layer preferences.", expected: "Every selected value remains observable." },
  { id: "TC-10", scenario: 4, title: "Test evidence", skill: "Upload + download", objective: "Attach evidence and download the generated QA report.", expected: "The selected filename and downloaded report are correct." },
  { id: "TC-11", scenario: 3, title: "Carrier widget", skill: "Open shadow root", objective: "Verify order status inside a third-party carrier component.", expected: "The carrier status changes to Verified." },
  { id: "TC-12", scenario: 4, title: "Receipt validation", skill: "Multiple page contexts", objective: "Validate the final receipt in a new browser tab.", expected: "Receipt OF-2048 opens and shows Paid." },
  { id: "TC-13", scenario: 5, title: "Service resilience", skill: "Success + delay + error", objective: "Validate normal, delayed, and failed service responses.", expected: "The UI reports the correct outcome after every request." },
  { id: "TC-14", scenario: 5, title: "Financial defect", skill: "Debugging + oracle", objective: "Detect an intentionally incorrect order total.", expected: "The expected total is identified as $59.96." },
  { id: "TC-15", scenario: 4, title: "Long report audit", skill: "Viewport + scrolling", objective: "Navigate a long audit report to its final assertion target.", expected: "The end-of-report checkpoint becomes visible." },
  { id: "TC-16", scenario: 6, title: "API & database", skill: "CRUD + persistent D1", objective: "Run persistent order operations across the API and database.", expected: "Create, read, update, and delete return documented results and persist correctly." },
];

const scenarios = [
  { id: 1, title: "Customer order management", risk: "Incorrect totals or invalid customer data", coverage: "Locators · forms · controls · calculations" },
  { id: 2, title: "Payment processing", risk: "Failed authorization or unhandled decisions", coverage: "Iframe · dialogs · negative payment path" },
  { id: 3, title: "Fulfillment workflow", risk: "Orders stuck or inventory not reserved", coverage: "Waits · nested frames · dynamic DOM · Shadow DOM" },
  { id: 4, title: "Evidence & audit", risk: "Missing proof of execution or receipt", coverage: "Files · tabs · full-page scrolling" },
  { id: 5, title: "Reliability & defects", risk: "Failures hidden by happy-path tests", coverage: "Latency · server errors · defect detection" },
  { id: 6, title: "API & data integrity", risk: "UI and persisted order data disagree", coverage: "REST CRUD · status validation · database persistence" },
];

const paymentFrame = `<!doctype html><html><head><style>*{box-sizing:border-box}body{font:14px Arial;margin:0;padding:24px;background:#f8f6ef;color:#18211b}h2{margin:0 0 5px}p{color:#687069;margin:0 0 22px}label{display:grid;gap:6px;margin:13px 0;font-weight:700}input{font:inherit;padding:11px;border:1px solid #abb2ac;background:white}button{width:100%;padding:12px;border:0;background:#6d4aff;color:white;font-weight:800;cursor:pointer;margin-top:8px}#result{min-height:22px;margin-top:15px;font-weight:800}.ok{color:#297242}.error{color:#b43d3d}.row{display:grid;grid-template-columns:1fr 1fr;gap:10px}</style></head><body><h2 data-testid="payment-title">Secure test payment</h2><p>No real payment is processed.</p><form id="pay-form"><label>Cardholder name<input id="card-name" data-testid="card-name" required></label><label>Card number<input id="card-number" data-testid="card-number" inputmode="numeric" placeholder="4242 4242 4242 4242" required></label><div class="row"><label>Expiry<input id="expiry" data-testid="expiry" placeholder="12/30" required></label><label>CVV<input id="cvv" data-testid="cvv" placeholder="123" required></label></div><button data-testid="authorize-payment">Authorize test payment</button></form><div id="result" role="status" data-testid="payment-result"></div><script>document.getElementById('pay-form').addEventListener('submit',function(e){e.preventDefault();var number=document.getElementById('card-number').value.replace(/\\s/g,'');var result=document.getElementById('result');if(number==='4242424242424242'){result.className='ok';result.textContent='Payment authorized';}else{result.className='error';result.textContent='Card declined: use the provided test number';}});</script></body></html>`;

export default function QALab() {
  const [activeCase, setActiveCase] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [orderModal, setOrderModal] = useState(false);
  const [tracking, setTracking] = useState("Processing");
  const [trackingBusy, setTrackingBusy] = useState(false);
  const [alertResult, setAlertResult] = useState("No alert handled yet.");
  const [revealed, setRevealed] = useState(false);
  const [rangeValue, setRangeValue] = useState(35);
  const [uploadName, setUploadName] = useState("No file selected");
  const [networkStatus, setNetworkStatus] = useState("Idle");
  const [bugResult, setBugResult] = useState("Choose the defect you observe.");

  const totals = useMemo(() => {
    const subtotal = 48 * quantity;
    const discount = couponApplied ? subtotal * 0.1 : 0;
    const shipping = 8;
    const tax = (subtotal - discount) * 0.0825;
    return { subtotal, discount, shipping, tax, total: subtotal - discount + shipping + tax };
  }, [quantity, couponApplied]);

  function complete(index: number) {
    setCompleted((items) => items.includes(index) ? items : [...items, index]);
  }

  function applyCoupon() {
    setCouponApplied(coupon.trim().toUpperCase() === "SAVE10");
  }

  function submitCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOrderModal(true);
    complete(1);
  }

  function runTracking() {
    setTracking("Processing"); setTrackingBusy(true);
    window.setTimeout(() => setTracking("Packed"), 900);
    window.setTimeout(() => { setTracking("Shipped"); setTrackingBusy(false); complete(2); }, 1900);
  }

  function simulateNetwork(mode: "success" | "slow" | "error") {
    setNetworkStatus(mode === "slow" ? "Loading…" : "Requesting…");
    window.setTimeout(() => setNetworkStatus(mode === "success" ? "200 OK — 3 orders loaded" : mode === "error" ? "500 Internal Server Error" : "200 OK — delayed response received"), mode === "slow" ? 1800 : 500);
  }

  const progress = Math.round((completed.length / cases.length) * 100);

  return (
    <main className="qa-page learning-lab" id="main-content" data-testid="qa-learning-lab">
      <nav className="lab-nav" aria-label="QA Lab navigation">
        <a className="mark" href="/" aria-label="Back to QA Automation Testing Playground">SA<span>.</span></a>
        <div className="lab-page-links"><a className="active" href="/qa-lab">QA Lab</a><a href="/advanced-qa">Advanced QA</a></div>
        <a href="/" data-testid="back-to-portfolio">← Playground</a>
      </nav>

      <header className="learning-hero">
        <div><p className="section-label light">Business-scenario automation lab</p><h1>Protect the full<br /><em>order lifecycle.</em></h1></div>
        <div className="learning-summary"><p>You are the QA engineer for <strong>OrderFlow</strong>. Complete six connected business scenarios covering checkout, payment, fulfillment, evidence, reliability, APIs, and persisted data.</p><div className="overall-progress"><span><strong>{completed.length}</strong> of {cases.length} tests completed</span><div><i style={{ width: `${progress}%` }} /></div><b>{progress}%</b></div></div>
      </header>

      <a className="advanced-program-banner" href="/advanced-qa">
        <span>Advanced QA</span>
        <strong>Continue into difficult UI, REST Assured, authentication, SOAP, SQL, accessibility, and reliability testing</strong>
        <em>Open the Advanced QA page →</em>
      </a>

      <section className="scenario-map" aria-label="Business scenario coverage">
        {scenarios.map((scenario) => {
          const scenarioCases = cases.map((testCase, index) => ({ testCase, index })).filter(({ testCase }) => testCase.scenario === scenario.id);
          const passed = scenarioCases.filter(({ index }) => completed.includes(index)).length;
          return <button key={scenario.id} className={cases[activeCase].scenario === scenario.id ? "active" : ""} onClick={() => setActiveCase(scenarioCases[0].index)}>
            <span>Scenario {scenario.id}</span><strong>{scenario.title}</strong><small>{scenario.coverage}</small><em>{passed}/{scenarioCases.length} passed</em>
          </button>;
        })}
      </section>

      <section className="lab-workspace">
        <aside className="case-list" aria-label="Test case list">
          {scenarios.map((scenario) => <div className="case-group" key={scenario.id}>
            <p className="case-label">Scenario {scenario.id} / {scenario.title}</p>
            {cases.map((testCase, index) => testCase.scenario === scenario.id && <button key={testCase.id} className={activeCase === index ? "active" : ""} onClick={() => setActiveCase(index)} data-testid={`select-${testCase.id.toLowerCase()}`}><span className={completed.includes(index) ? "done" : ""}>{completed.includes(index) ? "✓" : testCase.id.replace("TC-", "")}</span><div><small>{testCase.id}</small><strong>{testCase.title}</strong><em>{testCase.skill}</em></div></button>)}
          </div>)}
        </aside>

        <div className="case-stage">
          <div className="scenario-context">
            <div><span>Business scenario {cases[activeCase].scenario}</span><h2>{scenarios[cases[activeCase].scenario - 1].title}</h2></div>
            <p><strong>Business risk:</strong> {scenarios[cases[activeCase].scenario - 1].risk}</p>
          </div>
          <div className="test-brief" data-testid="test-brief">
            <div><span>Objective</span><p>{cases[activeCase].objective}</p></div>
            <div><span>Expected result</span><p>{cases[activeCase].expected}</p></div>
          </div>

          {activeCase === 0 && <section className="product-under-test" data-testid="cart-test-case">
            <div className="app-bar"><strong>OrderFlow</strong><span>Cart / OF-2048</span></div>
            <div className="cart-layout">
              <div className="product-line"><div className="product-art">AI</div><div><small>Learning toolkit</small><h2>AI Upskill Workbook</h2><p>Digital exercises + printed field guide</p><strong>$48.00</strong></div><label>Quantity<select value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} data-testid="quantity-select"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option></select></label></div>
              <aside className="order-summary"><h3>Order summary</h3><dl><div><dt>Subtotal</dt><dd data-testid="subtotal">${totals.subtotal.toFixed(2)}</dd></div><div><dt>Discount</dt><dd data-testid="discount">-${totals.discount.toFixed(2)}</dd></div><div><dt>Shipping</dt><dd>${totals.shipping.toFixed(2)}</dd></div><div><dt>Tax (8.25%)</dt><dd data-testid="tax">${totals.tax.toFixed(2)}</dd></div><div className="grand-total"><dt>Total</dt><dd data-testid="grand-total">${totals.total.toFixed(2)}</dd></div></dl><label>Coupon code<div className="coupon-row"><input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Try SAVE10" data-testid="coupon-input" /><button onClick={applyCoupon} data-testid="apply-coupon">Apply</button></div></label>{coupon && <p className={couponApplied ? "coupon-ok" : "coupon-error"} role="status" data-testid="coupon-message">{couponApplied ? "Coupon SAVE10 applied." : "Coupon is not valid."}</p>}</aside>
            </div>
            <div className="case-complete"><p><strong>Automation idea:</strong> select quantity 2, apply SAVE10, then assert total equals $101.53.</p><button onClick={() => complete(0)} data-testid="complete-cart-case">Mark test passed</button></div>
          </section>}

          {activeCase === 1 && <section className="product-under-test" data-testid="checkout-test-case">
            <div className="app-bar"><strong>OrderFlow</strong><span>Checkout / Shipping</span></div>
            <form className="checkout-form" onSubmit={submitCheckout} data-testid="shipping-form">
              <div className="form-title"><span>1</span><div><h2>Shipping information</h2><p>All fields are required. Use invalid data first to observe browser validation.</p></div></div>
              <div className="field-grid"><label>Full name<input required minLength={3} name="name" data-testid="shipping-name" /></label><label>Email<input required type="email" name="email" data-testid="shipping-email" /></label><label className="wide">Street address<input required name="address" data-testid="shipping-address" /></label><label>City<input required name="city" data-testid="shipping-city" /></label><label>ZIP code<input required pattern="[0-9]{5}" title="Enter a 5-digit ZIP code" name="zip" data-testid="shipping-zip" /></label><label className="wide">Delivery speed<select required defaultValue="" data-testid="delivery-speed"><option value="" disabled>Select delivery speed</option><option>Standard — 5 to 7 days</option><option>Express — 2 days</option></select></label></div>
              <label className="terms"><input type="checkbox" required data-testid="terms-checkbox" /> I confirm the shipping information is correct.</label>
              <button className="checkout-button" type="submit" data-testid="place-order">Place test order</button>
            </form>
          </section>}

          {activeCase === 2 && <section className="product-under-test" data-testid="tracking-test-case">
            <div className="app-bar"><strong>OrderFlow</strong><span>Orders / OF-2048</span></div>
            <div className="tracking-panel"><div><small>ORDER #OF-2048</small><h2>AI Upskill Workbook</h2><p>Expected arrival: Friday, July 31</p></div><span className={`tracking-badge ${tracking.toLowerCase()}`} role="status" data-testid="tracking-status">{tracking}</span></div>
            <ol className="timeline" aria-label="Order progress"><li className="reached"><span>✓</span><div><strong>Order confirmed</strong><small>Payment and address verified</small></div></li><li className={tracking === "Packed" || tracking === "Shipped" ? "reached" : ""}><span>{tracking === "Packed" || tracking === "Shipped" ? "✓" : "2"}</span><div><strong>Packed</strong><small>Prepared at the fulfillment center</small></div></li><li className={tracking === "Shipped" ? "reached" : ""}><span>{tracking === "Shipped" ? "✓" : "3"}</span><div><strong>Shipped</strong><small>Handed to the delivery partner</small></div></li></ol>
            <div className="tracking-actions"><div><strong>What to verify</strong><p>The statuses must appear in order. Your test should wait for each visible state instead of using a fixed sleep.</p></div><button disabled={trackingBusy} onClick={runTracking} data-testid="run-tracking">{trackingBusy ? "Updating order…" : "Run status simulation"}</button></div>
          </section>}

          {activeCase === 3 && <section className="product-under-test" data-testid="payment-test-case">
            <div className="app-bar"><strong>OrderFlow</strong><span>Checkout / Payment</span></div>
            <div className="frame-exercise"><div><h2>Payment is isolated in an iframe</h2><p>A normal page locator cannot see inside it. Switch to the frame, enter the provided safe test data, submit, and verify the result.</p><ul><li>Card: <code>4242 4242 4242 4242</code></li><li>Expiry: <code>12/30</code></li><li>CVV: <code>123</code></li></ul><button onClick={() => complete(3)} data-testid="complete-payment-case">I verified “Payment authorized”</button></div><iframe title="OrderFlow secure payment" srcDoc={paymentFrame} sandbox="allow-scripts" data-testid="payment-iframe" /></div>
          </section>}
          {activeCase >= 4 && <section className="product-under-test guided-advanced"><div className="app-bar"><strong>OrderFlow Test Console</strong><span>{cases[activeCase].id}</span></div><div className="advanced-body">
            {activeCase===4&&<div className="locator-stack"><button id="guided-id">Find by ID</button><button name="guided-name">Find by name</button><button aria-label="Guided accessible action">Find by label</button><input placeholder="Find by placeholder"/><p>Unique text: Order quality verified</p></div>}
            {activeCase===5&&<div><div className="alert-buttons"><button onClick={()=>{window.alert("Order saved");setAlertResult("Simple accepted.")}}>Simple</button><button onClick={()=>setAlertResult(window.confirm("Cancel?")?"Confirmed":"Dismissed")}>Confirm</button><button onClick={()=>setAlertResult(`Prompt: ${window.prompt("Reviewer","Sadwika")||"cancelled"}`)}>Prompt</button></div><output>{alertResult}</output></div>}
            {activeCase===6&&<iframe src="/qa-lab/frame-outer" title="Guided outer frame"/>}
            {activeCase===7&&<div><button className="lab-action" onClick={()=>setRevealed(!revealed)}>{revealed?"Hide":"Reveal token"}</button>{revealed&&<div className="revealed-box">OF-TOKEN-88</div>}</div>}
            {activeCase===8&&<div><label>Coverage {rangeValue}%<input type="range" value={rangeValue} onChange={e=>setRangeValue(Number(e.target.value))}/></label><fieldset><label><input type="radio" name="b" defaultChecked/>Chromium</label><label><input type="radio" name="b"/>Firefox</label></fieldset><select multiple><option>UI</option><option>API</option><option>Database</option></select></div>}
            {activeCase===9&&<div><input type="file" onChange={e=>setUploadName(e.target.files?.[0]?.name||"None")}/><output>{uploadName}</output><a className="download-button" download="report.txt" href="data:text/plain,OrderFlow%20QA%20Report">Download report</a></div>}
            {activeCase===10&&<ShadowOrderWidget/>}
            {activeCase===11&&<a className="download-button" href="/qa-lab/new-window" target="_blank">Open receipt ↗</a>}
            {activeCase===12&&<div><div className="network-buttons"><button onClick={()=>simulateNetwork("success")}>Success</button><button onClick={()=>simulateNetwork("slow")}>Slow</button><button onClick={()=>simulateNetwork("error")}>Error</button></div><output>{networkStatus}</output></div>}
            {activeCase===13&&<div><p>48.00 + 8.00 + 3.96; displayed total $58.96</p><button onClick={()=>setBugResult("Correct — expected $59.96.")}>Identify incorrect total</button><output>{bugResult}</output></div>}
            {activeCase===14&&<a className="download-button" href="#scroll-finish">Scroll to target ↓</a>}
            {activeCase===15&&<div><h2>Persistent Orders API</h2><a className="download-button" href="/qa-lab/api-data">Open guided TC-16 suite →</a></div>}
          </div><div className="case-complete"><p>{cases[activeCase].expected}</p><button onClick={()=>complete(activeCase)}>Mark test passed</button></div></section>}
        </div>
      </section>

      <section className="academy" id="locator-academy" data-testid="locator-academy" hidden>
        <header><p className="section-label light">Extended practice zone</p><h2>Locator & interaction academy</h2><p>After completing the order journey, use these focused challenges to practice the browser behaviors that appear in larger automation suites.</p></header>
        <div className="academy-grid">
          <article className="academy-card" data-testid="locator-gallery"><span>05 / Locators</span><h3>Locator gallery</h3><p>Target the same interface using semantic and structural strategies.</p><div className="locator-stack"><button id="unique-id-button">Find by ID</button><button name="named-action">Find by name</button><button aria-label="Archive test order">Find by accessible label</button><button title="Helpful tooltip locator">Find by title</button><input placeholder="Find by placeholder" /><a href="#scroll-finish">Find by link text</a><p className="exact-copy">Unique visible text: Order quality verified</p><div className="parent-box"><span>Parent container</span><strong data-testid="nested-child">Nested child element</strong></div></div></article>

          <article className="academy-card" data-testid="alerts-gallery"><span>06 / Alerts</span><h3>Browser alerts</h3><p>Handle blocking browser dialogs and assert the returned value.</p><div className="alert-buttons"><button onClick={() => { window.alert("Order saved successfully"); setAlertResult("Simple alert accepted."); }} data-testid="simple-alert">Simple alert</button><button onClick={() => setAlertResult(window.confirm("Cancel order OF-2048?") ? "Confirmation accepted." : "Confirmation dismissed.")} data-testid="confirm-alert">Confirm alert</button><button onClick={() => { const value = window.prompt("Enter reviewer name", "Sadwika"); setAlertResult(value ? `Prompt returned: ${value}` : "Prompt cancelled."); }} data-testid="prompt-alert">Prompt alert</button></div><output data-testid="alert-result">{alertResult}</output></article>

          <article className="academy-card span-two" data-testid="nested-frame-gallery"><span>07 / Frames</span><h3>Iframe inside an iframe</h3><p>Switch from the main document to the outer fulfillment frame, then into the inner inventory frame.</p><div className="frame-map"><code>page</code><b>→</b><code>outer-frame</code><b>→</b><code>inner-frame</code></div><iframe src="/qa-lab/frame-outer" title="Outer fulfillment frame" data-testid="outer-frame" /></article>

          <article className="academy-card" data-testid="dynamic-gallery"><span>08 / Dynamic DOM</span><h3>Hidden & delayed elements</h3><p>Test visibility, element appearance, and changing content.</p><button onClick={() => setRevealed(!revealed)} data-testid="toggle-secret">{revealed ? "Hide secret" : "Reveal secret"}</button>{revealed && <div className="revealed-box" role="status" data-testid="revealed-content">Dynamic order token: OF-TOKEN-88</div>}<details><summary data-testid="expand-details">Expandable test notes</summary><p data-testid="details-content">This content exists in the DOM and becomes visible after expansion.</p></details></article>

          <article className="academy-card" data-testid="controls-gallery"><span>09 / Controls</span><h3>Mouse & keyboard controls</h3><p>Practice focus, hover, range inputs, radio buttons, and multi-select.</p><label>Test coverage: <strong data-testid="range-value">{rangeValue}%</strong><input type="range" min="0" max="100" value={rangeValue} onChange={(e) => setRangeValue(Number(e.target.value))} data-testid="coverage-range" /></label><fieldset><legend>Browser</legend><label><input type="radio" name="browser" value="chromium" defaultChecked /> Chromium</label><label><input type="radio" name="browser" value="firefox" /> Firefox</label></fieldset><label>Test layers<select multiple size={3} data-testid="multi-select"><option>UI</option><option>API</option><option>Database</option></select></label><button className="hover-target" data-testid="hover-target"><span>Hover or focus me</span><em>Tooltip is visible</em></button></article>
          <article className="academy-card" data-testid="file-gallery"><span>10 / Files</span><h3>Upload & download</h3><p>Upload a fixture, assert its filename, then verify a report download.</p><label className="file-drop">Attach test evidence<input type="file" onChange={(e) => setUploadName(e.target.files?.[0]?.name || "No file selected")} data-testid="file-upload" /></label><output data-testid="uploaded-file-name">{uploadName}</output><a className="download-button" download="orderflow-test-report.txt" href="data:text/plain;charset=utf-8,OrderFlow%20QA%20Report%0AOrder%3A%20OF-2048%0AStatus%3A%20Passed" data-testid="download-report">Download test report</a></article>
          <article className="academy-card" data-testid="shadow-gallery"><span>11 / Encapsulation</span><h3>Shadow DOM</h3><p>Enter the open shadow root and assert its internal status.</p><ShadowOrderWidget /></article>
          <article className="academy-card" data-testid="window-gallery"><span>12 / Windows</span><h3>New tab & window</h3><p>Capture a new page, verify its receipt, then return.</p><a className="download-button" href="/qa-lab/new-window" target="_blank" rel="noopener" data-testid="open-new-tab">Open receipt in new tab ↗</a></article>
          <article className="academy-card" data-testid="network-gallery"><span>13 / Network</span><h3>Network outcomes</h3><p>Practice success, delayed, and error branches.</p><div className="network-buttons"><button onClick={() => simulateNetwork("success")}>Success</button><button onClick={() => simulateNetwork("slow")}>Slow</button><button onClick={() => simulateNetwork("error")}>Error</button></div><output className="network-output" data-testid="network-status">{networkStatus}</output></article>
          <article className="academy-card span-two bug-hunt" data-testid="bug-hunt-gallery"><span>14 / Debugging</span><h3>Intentional bug hunt</h3><p>Item $48.00 + shipping $8.00 + tax $3.96, but the displayed total is <strong data-testid="buggy-total">$58.96</strong>.</p><div className="network-buttons"><button onClick={() => setBugResult("Not quite.")}>Tax label is missing</button><button onClick={() => setBugResult("Correct — expected $59.96.")} data-testid="bug-choice-total">Total is incorrect</button></div><output data-testid="bug-result">{bugResult}</output></article>
        </div>
        <a className="api-lab-banner" href="/qa-lab/api-data" data-testid="open-api-database-lab"><span>16 / API + Database</span><strong>Open the persistent Orders API lab</strong><em>Practice GET, POST, PATCH, DELETE, validation, latency, errors, and database assertions →</em></a>
        <div className="scroll-track" aria-label="Full page scroll challenge"><div><span>15 / Scrolling</span><h3>Full-page scroll checkpoint</h3><p>Automate scrolling to the final target and assert that it enters the viewport.</p></div><a href="#scroll-finish" data-testid="jump-to-finish">Jump to finish ↓</a></div>
        <div className="scroll-spacer"><span>Keep scrolling</span><span>Observe lazy-style checkpoints</span><span>Almost there</span></div>
        <div className="scroll-finish" id="scroll-finish" data-testid="scroll-finish"><span>✓</span><div><p className="section-label">Scroll assertion target</p><h3>You reached the end of the test suite.</h3><p>Assert this element is visible, then scroll back to the active test case.</p></div><a href="#main-content">Back to top ↑</a></div>
      </section>

      {orderModal && <div className="modal-backdrop" role="presentation" data-testid="order-modal-backdrop"><section className="modal order-success" role="dialog" aria-modal="true" aria-labelledby="order-title" data-testid="order-confirmation"><button className="modal-close" onClick={() => setOrderModal(false)} aria-label="Close confirmation">×</button><span className="success-check">✓</span><p className="section-label">Test order created</p><h2 id="order-title">Order #OF-2048 confirmed</h2><p>The valid checkout path reached the expected confirmation state.</p><dl><div><dt>Status</dt><dd>Processing</dd></div><div><dt>Total</dt><dd>$52.96</dd></div></dl><button className="lab-action" onClick={() => setOrderModal(false)} data-testid="close-order-confirmation">Continue testing</button></section></div>}
    </main>
  );
}
