async function test() {
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idPassportNumber: "HIGH001", phone: "+94771000004" })
  });
  
  const cookie = loginRes.headers.get("set-cookie");
  
  const eligRes = await fetch("http://localhost:3000/api/student/eligibility", {
    headers: { "Cookie": cookie }
  });
  
  console.log("Eligibility:", await eligRes.json());
}

test();
