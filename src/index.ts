import * as http from 'http'
import * as querystring from 'querystring'
import { google }from 'googleapis'
import * as open from 'open'
import { OAuth2Client } from 'googleapis-common'
import { Credentials } from 'google-auth-library'

export class GoauthCli {
	private client?: OAuth2Client

	constructor(
		private clientId: string,
		private clientSecret: string,
		private scopes: string[]
	) { }

	/**
	 * Start the login workflow and return an authorized gapi client
	 * when complete.
	 * 
	 * @param {number} [callbackPort]
	 * @param {string} [callbackPath = '/oauth-callback']
	 * @returns {Promise}
	 */
	login(callbackPort?: number, callbackPath = '/oauth-callback') {
		return new Promise((resolve, reject) => {

			// Create an HTTP server to listen for oauth callback
			const server = http.createServer(async (req, res) => {
				if (!req.url) {
					res.statusCode = 400
					return res.end()
				}

				if (req.url.indexOf(callbackPath) < 0) {
					res.statusCode = 404
					return res.end()
				}

				res.statusCode = 200
				res.end()
				server.close()

				try {
					await this.oauthCallback(req.url)
					resolve(this.client)
				} catch (err) {
					reject(err)
				}

			})

			// Start the HTTP server
			server.listen(callbackPort, () => {
				const address = server.address()
				if (!address || typeof address !== 'object') {
					server.close()
					throw new Error('Failed to start server')
				}

				const port = address.port
				this.initClient(`http://127.0.0.1:${port}${callbackPath}`)
			})
		})
	}

	private async initClient(callbackUrl: string) {
		this.client = new google.auth.OAuth2(
			this.clientId,
			this.clientSecret,
			callbackUrl
		)

		const authUrl = this.client.generateAuthUrl({
			access_type: 'offline',
			scope: this.scopes,
		})

		const cp = await open(authUrl, { wait: false })
		cp.unref()
	}

	private async oauthCallback(url: string) {
		if (!this.client) {
			throw new Error('Client is not initialized')
		}

		const qs = url.split('?')[1]
		const params = querystring.parse(qs)

		if (!params || !params.code) {
			throw new Error('No code returned')
		}

		const code = Array.isArray(params.code)
			? params.code[0]
			: params.code

		const { tokens } = await this.client.getToken(code)

		this.updateCredentials(tokens)
		this.client.on('tokens', this.updateCredentials)
	}

	private updateCredentials(tokens: Credentials) {
		if (!this.client) {
			throw new Error('Client is not initialized')
		}

		this.client.setCredentials(tokens)
	}
}
