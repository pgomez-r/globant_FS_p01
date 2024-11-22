# 42-Globant Metapilot Project 01

This project is a simple image searcher powered by the Unsplash API. It is not hosted in a domain and has no backend service, so if you want to display and try it, please follow instructions.

## User setup

1. **Clone the Repository**:
	```sh
	git clone https://github.com/pgomez-r/globant_FS_p01.git globant_p01
	cd globant_p01
	```

2. **Provide valid API credentials**
	You need to have an account on Unsplash and registrer an app in **Developers/API** at https://unsplash.com/developers

	Then go to **Yours Apps** at https://unsplash.com/oauth/applications and configure **Redirect URI & Permissions**.
	- Add `http://localhost:5500/callback.html` to *Redirect URI* field.
	- **Mark all permissions**.

3. **Ensure Configuration File**:
	Create the necessary configuration file called `server-config.json` in the root directory. 
	
	```sh
	#Create server configuration json file
	touch server-config.json
	```

	The file should look like this:
	```json
	{
		"clientId": "YOUR_UNSPLASH_CLIENT_ID",
		"clientSecret": "YOUR_UNSPLASH_CLIENT_SECRET",
		"responseType": "code",
		"scope": "public+write_likes",
		"tokenEndpoint": "https://unsplash.com/oauth/token"
	}
	```

4. **Deploy with Docker**:
	You need to deploy project using Docker, which will generate the necessary javaScript files and run local server to display the website.
	Follow the steps:

	```sh
	#Get into project root folder
	cd globant_p01/ex00

	#Deploy with Docker
	make
	```

5. **Open Your Browser**:
	Open your browser and navigate to http://localhost:5500

6. **Stop and clean Docker**:
	When finished, you can use the rules stop and clean of Makefile to stop the Docker container from running and remove all images and networks, cache, etc.
	```sh
	#Stop docker container
	make stop

	#Remove docker images, networks and cache
	make clean
	```

## Usage

- **Search for Images**: Use the search box to search for images.
- **Login with Unsplash**: Click the "Login with Unsplash" button to authenticate with any Unsplash account.
- **Show More Images**: Click the "Show More" button to load more images.
- **Like/Unlike button**: Click to add/remove image from the logged user Unsplash account.
- **Recent likes section**: Shows images that has been saved in this browser session.
- **Show Likes**: Click to show (in another page) all the images saved as liked in the logged user Unsplash account.
- **Go to your Unsplash account**: Link to redirect to user profile on Unsplash website.

## Upcoming Features

- **Null search**: Manage message or behaviour when the search gets no results or has empty query
- **API consumption optimisation**: Improve logic in the scripts to use less API requests.
- **Add backend/hosting**