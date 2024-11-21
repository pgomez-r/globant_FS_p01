/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   auth.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: pgomez-r <pgomez-r@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2024/11/21 11:21:01 by pgomez-r          #+#    #+#             */
/*   Updated: 2024/11/21 15:52:32 by pgomez-r         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// Load API credentials and configurations from server-config.json
fetch('server-config.json')
	.then(response => response.json())
	.then(config => {
		const clientId = config.clientId;
		const clientSecretKey = config.clientSecretKey;
		const responseType = config.responseType;
		const scope = config.scope;
		const tokenEndpoint = config.tokenEndpoint;
		const redirectUri = `${window.location.origin}/callback.html`;
		const authUrl = `https://unsplash.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${scope}&prompt=consent`;

		console.log("redURI: ", redirectUri);
		console.log("authURL: ", authUrl);

		// Add event listener to the login button
		document.getElementById('login-button')?.addEventListener('click', async () => {
			const accessToken = localStorage.getItem('unsplash_access_token');
			console.log("accestoken: ", accessToken);
			if (accessToken && await verifyAccessToken(accessToken))
				alert('Already have access to Unsplash API');
			else {
				localStorage.removeItem('unsplash_access_token');
				window.location.href = authUrl;}
		});

		// Only handle the authorization code if on the callback page
		if (window.location.pathname === '/callback.html') {
			handleCallback(clientId, clientSecretKey, tokenEndpoint, redirectUri);
		}else {
			console.log("Not on callback page, current path:", window.location.pathname);
		}
		
	})
	.catch(error => console.error('Error loading config:', error));

// Function to handle the callback and exchange the authorization code for an access token
function handleCallback(clientId: string, clientSecretKey: string, tokenEndpoint: string, redirectUri: string) {
	console.log("actual URL: ", window.location.href);

	// Handle the authorization code in the callback page
	const urlParams = new URLSearchParams(window.location.search);
	console.log("url after authURL accessed: ", urlParams);
	const code = urlParams.get('code');

	if (code) {
		// Exchange the authorization code for an access token
		fetch(tokenEndpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: new URLSearchParams({
				client_id: clientId,
				client_secret: clientSecretKey,
				redirect_uri: redirectUri,
				code: code,
				grant_type: 'authorization_code'
			})
		})
		.then(response => response.json())
		.then(data => {
			// Store the access token securely
			localStorage.setItem('unsplash_access_token', data.access_token);
			// Redirect to the main page
			window.location.href = '/index.html';
		})
		.catch(error => console.error('Error exchanging code for token:', error));
	}
	else
		console.error('Authorization code not found');
}

async function verifyAccessToken(accessToken: string): Promise<boolean> {
	const url = 'https://api.unsplash.com/me';
	const response = await fetch(url, {
		method: 'GET',
		headers: {
			'Authorization': `Bearer ${accessToken}`
		}
	});

	if (response.ok) {
		console.log("Access token is valid.");
		return (true);
	}
	else {
		console.log("Access token is invalid or expired.");
		return (false);
	}
}
