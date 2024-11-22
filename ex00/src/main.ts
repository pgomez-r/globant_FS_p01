/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   main.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: pgomez-r <pgomez-r@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2024/11/21 11:21:32 by pgomez-r          #+#    #+#             */
/*   Updated: 2024/11/22 13:48:26 by pgomez-r         ###   ########.fr       */
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

//Saving the HTML elements into JS variables
const	searchForm = document.querySelector("#search-form");
const	searchBox = document.querySelector("#search-box");
const	searchResults = document.querySelector("#search-results");
const	showMore = document.querySelector("#show-more");
const	recentLikes = document.querySelector("#recent-likes");
const	favGalleryButton = document.querySelector("#fav-gallery-button") as HTMLElement;

let		keyword = "";
let		page = 1;
let		apiClient = "";
let 	isLoggedIn = false;
let 	headers: { [key: string]: string } = {
	'Content-Type': 'application/json'
};

fetch('server-config.json')
	.then(response => response.json())
	.then(config => {
		apiClient = config.clientId;
	})
	.catch(error => console.error('Error loading config:', error));

// Check for access token and set headers
(async () => {
	const accessToken = localStorage.getItem('unsplash_access_token');
	if (accessToken && await verifyAccessToken(accessToken)) {
		headers = {
			...headers,
			'Authorization': `Bearer ${accessToken}`
		};
		isLoggedIn = true;
		if (favGalleryButton)
		{
			favGalleryButton.style.display = "block";
			favGalleryButton.addEventListener('click', () => {
				window.location.href = 'favorites.html';
			})
		}
	}
})();

//Event-listeners
if (searchForm)
{
	searchForm.addEventListener("submit", (e) => {
	//Avoid page to reload by itself (I don't fully understand this T_T)
	e.preventDefault();
	page = 1;
	searchImages();
})
}

if (showMore)
{
	showMore.addEventListener("click", () => {
	page++;
	searchImages();
})
}

async function	searchImages()
{
	if (searchBox)
	{
		const	inputElement = searchBox as HTMLInputElement;
		keyword = inputElement.value;
	}
	//Compose the URL according to API documentation
	const	url = `https://api.unsplash.com/search/photos?page=${page}&query=${keyword}&client_id=${apiClient}`;
	//Fetch-response
	const	response = await fetch(url, {
		method: 'GET',
		headers: headers
	});
	const	data = await response.json();
	//If first time search, clean the container
	if (page === 1 && searchResults)
		searchResults.innerHTML = "";
	const	results: UnsplashResult[] = data.results;
	//For each reasult, create HTML elements inside search-result div
	//Element img, element link ('a'), element fav-button
	results.map((result: UnsplashResult) => {
		const	imageContainer = document.createElement("div");
		imageContainer.classList.add("image-container");
		const	image = document.createElement("img");
		image.src = result.urls.small;
		const	imageLink = document.createElement("a");
		imageLink.href = result.links.html;
		imageLink.target = "_blank";
		imageLink.appendChild(image);
		imageContainer.appendChild(imageLink);
		//Create-render (or not) fav-button element
		if (isLoggedIn) {	
			const	favButton = document.createElement("button");
			favButton.classList.add("fav-button");
			if (result.liked_by_user) {
				favButton.textContent = 'Unlike';
				favButton.classList.add('unlike-button');
				favButton.addEventListener('click', () => unlikeFavorite(result.id, favButton, result));
			} else {
				favButton.textContent = 'Like';
				favButton.classList.add('like-button');
				favButton.addEventListener('click', () => saveFavorite(result.id, favButton, result));
			}
			imageContainer.appendChild(favButton);
		}
		if (searchResults)
			searchResults.appendChild(imageContainer);
	});
	if (showMore)
	{
		const	inputElement = showMore as HTMLInputElement;
		inputElement.style.display = "block";
	}
}

async function saveFavorite(imageId: string, button: HTMLButtonElement, image: UnsplashResult) {
	const accessToken = localStorage.getItem('unsplash_access_token');
	if (!accessToken || !(await verifyAccessToken(accessToken))) {
		alert('You need to log in to save favorites.');
		return;
	}

	const url = `https://api.unsplash.com/photos/${imageId}/like`;
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${accessToken}`,
			'Content-Type': 'application/json'
		}
	});

	if (response.ok)
	{
		button.textContent = 'Unlike';
		button.classList.remove('like-button');
		button.classList.add('unlike-button');
		button.removeEventListener('click', () => saveFavorite(imageId, button, image));
		button.addEventListener('click', () => unlikeFavorite(imageId, button, image));
		alert('Image saved as favorite!');
		// Update local storage array of liked images (add = push)
		let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
		favorites.push(image);
		localStorage.setItem('favorites', JSON.stringify(favorites));
		showRecent();
	}
	else
	{
		const errorData = await response.json();
		console.error('Error saving favorite:', response.statusText, errorData);
		alert('Failed to save favorite. Please try again.');
	}
}

async function unlikeFavorite(imageId: string, button: HTMLButtonElement, image: UnsplashResult) {
	const accessToken = localStorage.getItem('unsplash_access_token');
	if (!accessToken || !(await verifyAccessToken(accessToken))) {
		alert('You need to log in to unlike favorites.');
		return;
	}

	const url = `https://api.unsplash.com/photos/${imageId}/like`;
	const response = await fetch(url, {
		method: 'DELETE',
		headers: {
			'Authorization': `Bearer ${accessToken}`,
			'Content-Type': 'application/json'
		}
	});

	if (response.ok)
	{
		button.textContent = 'Like';
		button.classList.remove('unlike-button');
		button.classList.add('like-button');
		button.removeEventListener('click', () => unlikeFavorite(imageId, button, image));
		button.addEventListener('click', () => saveFavorite(imageId, button, image));
		alert('Image unliked!');
		// Update local storage array of liked images (delete = filter all but this->imageId)
		let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
		favorites = favorites.filter((fav: UnsplashResult) => fav.id !== imageId);
		localStorage.setItem('favorites', JSON.stringify(favorites));
		showRecent();
	}
	else
	{
		const errorData = await response.json();
		console.error('Error unliking favorite:', response.statusText, errorData);
		alert('Failed to unlike favorite. Please try again.');
	}
}

showRecent();

function	showRecent()
{
	if (localStorage.getItem('favorites'))
	{
		const	favHeader = document.querySelector("h2");
		if (favHeader)
			favHeader.style.display = 'block';
	}
	let	favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
	if (recentLikes)
		recentLikes.innerHTML = "";
	favorites.map((result: UnsplashResult) => {
		const	imageContainer = document.createElement("div");
		imageContainer.classList.add("image-container");
		const	image = document.createElement("img");
		image.src = result.urls.small;
		const	imageLink = document.createElement("a");
		imageLink.href = result.links.html;
		imageLink.target = "_blank";
		imageLink.appendChild(image);
		imageContainer.appendChild(imageLink);
		if (recentLikes)
			recentLikes.appendChild(imageContainer);
	});
}


// Example of an Unsplash Result
// {
//     "id": "Dwu85P9SOIk",
//     "created_at": "2016-05-03T11:00:28-04:00",
//     "updated_at": "2021-05-03T11:00:28-04:00",
//     "width": 2448,
//     "height": 3264,
//     "color": "#6E633A",
//     "blur_hash": "LFC$yHwc8^$yIAS$%M%00KxukYIp",
//     "downloads": 1345,
//     "likes": 24,
//     "liked_by_user": false,
//     "description": "A man drinking a coffee.",
//     "urls": {
//         "raw": "https://images.unsplash.com/photo-1417325384643-aac51acc9e5d",
//         "full": "https://images.unsplash.com/photo-1417325384643-aac51acc9e5d?crop=entropy&cs=srgb&fm=jpg&ixid=MnwyNjYzMzl8MHwxfGFsbHwxfHx8fHx8fHwxNjE5NTY3OTY2&ixlib=rb-1.2.1&q=85",
//         "regular": "https://images.unsplash.com/photo-1417325384643-aac51acc9e5d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwyNjYzMzl8MHwxfGFsbHwxfHx8fHx8fHwxNjE5NTY3OTY2&ixlib=rb-1.2.1&q=80&w=1080",
//         "small": "https://images.unsplash.com/photo-1417325384643-aac51acc9e5d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwyNjYzMzl8MHwxfGFsbHwxfHx8fHx8fHwxNjE5NTY3OTY2&ixlib=rb-1.2.1&q=80&w=400",
//         "thumb": "https://images.unsplash.com/photo-1417325384643-aac51acc9e5d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwyNjYzMzl8MHwxfGFsbHwxfHx8fHx8fHwxNjE5NTY3OTY2&ixlib=rb-1.2.1&q=80&w=200"
//     },
//     "links": {
//         "self": "https://api.unsplash.com/photos/Dwu85P9SOIk",
//         "html": "https://unsplash.com/photos/Dwu85P9SOIk",
//         "download": "https://unsplash.com/photos/Dwu85P9SOIk/download",
//         "download_location": "https://api.unsplash.com/photos/Dwu85P9SOIk/download"
//     }
// }

//JSON SERVER CONFIG #1
// {
// 	"clientId": "lqoh-bgRkh73bMRYrvXsqiJD54shb6LXAVYPQ6qZOJw",
// 	"clientSecretKey": "HxnFSULnr_yvdyGadKI3y6Vg79KRbDZRKab23DMxEdY",
// 	"responseType": "code",
// 	"scope": "public+write_likes",
// 	"tokenEndpoint": "https://unsplash.com/oauth/token"
// }

//JSON SERVER CONFIG #2
// {
// 	"clientId": "d6jbnVVBNRl3x6-WIJRuIvkupM9l8Dk6ibB7qR-1Of0",
// 	"clientSecretKey": "5adVc_LD9zFJShDtZbSpUApZGAIRIKTYzPljFmA0P3A",
// 	"responseType": "code",
// 	"scope": "public+write_likes",
// 	"tokenEndpoint": "https://unsplash.com/oauth/token"
// }
