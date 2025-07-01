async function getGravatarHash(email) {
    email = email.trim().toLowerCase();

    const encoder = new TextEncoder();

    const data = encoder.encode(email);

    const hash = await window.crypto.subtle.digest("SHA-256", data);

    const hashArray = Array.from(new Uint8Array(hash));

    const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(""); // convert bytes to hex string
    return hashHex;
}

window.akiraAPI.getGravatarEmail().then((email) => {
    if(email) {
        getGravatarHash(email).then(async (hash) => {
            // const data = JSON.parse(await(await fetch(`https://api.gravatar.com/v3/profiles/${hash}`)).text());
            // document.getElementById("user-img").src = data["avatar_url"];
        });
    }
});

document.getElementById("user-img").src = "./image/temp.png"

window.akiraAPI.getUsername().then((username) => {
    if(username) {
        document.getElementById("username").textContent = username;
    }
});
