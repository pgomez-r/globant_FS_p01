/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   favs.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: pgomez-r <pgomez-r@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2024/11/22 10:41:49 by pgomez-r          #+#    #+#             */
/*   Updated: 2024/11/22 13:48:21 by pgomez-r         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

//Defining the UnsplashResults so TS will not warm of type 'any' (strict)
interface	UnsplashResult
{
	urls: {
		small: string;
	};
	links: {
		html: string;
	};
	id: string;
	liked_by_user: boolean;
}

const	homeButton = document.querySelector('#home');
const	favGallery = document.querySelector('#favorites-gallery');
const	unsplashRedir = document.querySelector('#unsplash-account') as HTMLAnchorElement;

if (homeButton){
	homeButton.addEventListener("click", () => {
		window.location.href = "index.html";
});}

showFavorites();

async function showFavorites() {
	const accessToken = localStorage.getItem('unsplash_access_token');
	if (!accessToken) {
		alert('You need to log in to view favorites.');
		window.location.href = "index.html";
		return;
	}
	const userResponse = await fetch('https://api.unsplash.com/me', {
		method: 'GET',
		headers: {
			'Authorization': `Bearer ${accessToken}`,
			'Content-Type': 'application/json'
		}
	});

	if (!userResponse.ok) {
		const errorData = await userResponse.json();
		console.error('Error fetching user info:', userResponse.statusText, errorData);
		alert('Failed to fetch user info. Please try again.');
		return;
	}
	const userData = await userResponse.json();
	const username = userData.username;
	const headers: { [key: string]: string } = {
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${accessToken}`,
		'Cache-Control': 'no-cache'
	};
	if (unsplashRedir)
		unsplashRedir.href += `${username}` + "/likes";
	const url = `https://api.unsplash.com/users/${username}/likes?timestamp=${new Date().getTime()}`;
	const response = await fetch(url, {
		method: 'GET',
		headers: headers
	});
	if (response.ok) {
		const data = await response.json();
		displayFavorites(data);
	} else {
		const errorData = await response.json();
		console.error('Error fetching favorites:', response.statusText, errorData);
		alert('Failed to fetch favorites. Please try again.');
	}
}

function	displayFavorites(favorites: UnsplashResult[])
{
	if (favGallery)
		favGallery.innerHTML = "";

	favorites.forEach(result => {
		const imgContainer = document.createElement('div');
		imgContainer.classList.add('image-container');
		const image = document.createElement('img');
		image.src = result.urls.small;
		const imgLink = document.createElement('a');
		imgLink.href = result.links.html;
		imgLink.target = '_blank';
		imgLink.appendChild(image);
		imgContainer.appendChild(imgLink);
		if (favGallery)
			favGallery.appendChild(imgContainer);
	});
}
