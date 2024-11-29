export async function getMe() {
  return { name: "luna", email: "luna@example.com" };

  // const res = await axios.get(API_URL + "/users/me");
  // return res.status != 200
  //   ? null
  //   : { name: res.data.name, email: res.data.email };
}
