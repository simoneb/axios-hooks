# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.10.0](https://github.com/simoneb/axios-hooks/compare/v1.10.0-0...v1.10.0) (2020-04-13)

## [1.10.0-0](https://github.com/simoneb/axios-hooks/compare/v1.9.0...v1.10.0-0) (2020-04-11)


### Features

* **199:** add ability to disable cache ([b8f504a](https://github.com/simoneb/axios-hooks/commit/b8f504a1e85f415d70f17d1d38b6c17b33a1372f)), closes [#199](https://github.com/simoneb/axios-hooks/issues/199)

## [1.9.0](https://github.com/simoneb/axios-hooks/compare/v1.8.0...v1.9.0) (2019-12-12)


### Features

* **src/index.d.ts:** export useAxios related interfaces ([6f0fa2a](https://github.com/simoneb/axios-hooks/commit/6f0fa2a49470fa4276ad668baeeddd87e90c34ac))

## [1.8.0](https://github.com/simoneb/axios-hooks/compare/v1.8.0-2...v1.8.0) (2019-12-06)


### Bug Fixes

* correct @babel/preset-react version ([181ddcf](https://github.com/simoneb/axios-hooks/commit/181ddcf9509007f661332fb0f9904ea30af90022))

## [1.8.0-2](https://github.com/simoneb/axios-hooks/compare/v1.8.0-1...v1.8.0-2) (2019-12-06)


### Bug Fixes

* ts definitions for makeUseAxios ([13b20cc](https://github.com/simoneb/axios-hooks/commit/13b20ccf1a84e57b4771168b86338925052f6a9c))

## [1.8.0-1](https://github.com/simoneb/axios-hooks/compare/v1.7.2...v1.8.0-1) (2019-12-06)


### Features

* support multiple instances of useAxios configured independently ([2b0e9a5](https://github.com/simoneb/axios-hooks/commit/2b0e9a58ed55d581f2b06244d68fa8d5609ed50d)), closes [#98](https://github.com/simoneb/axios-hooks/issues/98)


### Bug Fixes

* ts definitions for makeUseAxios ([bbdb3e0](https://github.com/simoneb/axios-hooks/commit/bbdb3e0085d55027151b74690d63657ac0c1118d))

## [1.8.0-0](https://github.com/simoneb/axios-hooks/compare/v1.7.2...v1.8.0-0) (2019-11-30)


### Features

* support multiple instances of useAxios configured independently ([2b0e9a5](https://github.com/simoneb/axios-hooks/commit/2b0e9a58ed55d581f2b06244d68fa8d5609ed50d)), closes [#98](https://github.com/simoneb/axios-hooks/issues/98)

### [1.7.2](https://github.com/simoneb/axios-hooks/compare/v1.7.1...v1.7.2) (2019-11-13)


### Bug Fixes

* do not dispatch state updates when requests are cancelled ([307c7c1](https://github.com/simoneb/axios-hooks/commit/307c7c1565e9f2d36f0e90bd19a86815dde2d8ce)), closes [#74](https://github.com/simoneb/axios-hooks/issues/74)
* use StaticAxios for cancellation as AxiosInstance doesn't expose it ([4a63b6e](https://github.com/simoneb/axios-hooks/commit/4a63b6eab98f642372e1e2bb9d4429650183a1a9)), closes [#80](https://github.com/simoneb/axios-hooks/issues/80)
* **deps:** update dependency @babel/runtime to v7.7.2 ([ebeab51](https://github.com/simoneb/axios-hooks/commit/ebeab5102d0aa60d856f10addc68de4be82c69a9))

### [1.7.2-0](https://github.com/simoneb/axios-hooks/compare/v1.7.1...v1.7.2-0) (2019-11-10)

### [1.7.1](https://github.com/simoneb/axios-hooks/compare/v1.7.0...v1.7.1) (2019-11-07)


### Bug Fixes

* **build:** include typings in package ([0b43f5e](https://github.com/simoneb/axios-hooks/commit/0b43f5ea256a556f6a22261f7130b92db63ddbcc))

## [1.7.0](https://github.com/simoneb/axios-hooks/compare/v1.6.0...v1.7.0) (2019-11-07)


### Features

* support request cancellation ([8cf1f74](https://github.com/simoneb/axios-hooks/commit/8cf1f747c5ae839682f0a6e1da4170e3b1e7b066))

## [1.6.0](https://github.com/simoneb/axios-hooks/compare/v1.5.0...v1.6.0) (2019-10-23)


### Features

* async refetch ([f018d0a](https://github.com/simoneb/axios-hooks/commit/f018d0a31685003244c2be677845c6195646f2bd)), closes [#51](https://github.com/simoneb/axios-hooks/issues/51)

## [1.5.0](https://github.com/simoneb/axios-hooks/compare/v1.5.0-0...v1.5.0) (2019-10-23)

## [1.5.0-0](https://github.com/simoneb/axios-hooks/compare/v1.4.1...v1.5.0-0) (2019-10-22)


### Features

* maintain referential integrity of refetch function ([1c4c5ac](https://github.com/simoneb/axios-hooks/commit/1c4c5acdd56f5597269a0d9ae321daf2e587f5c8))


### Bug Fixes

* typing of serializeCache function ([3040b80](https://github.com/simoneb/axios-hooks/commit/3040b80696e7ab9df07f64ac6c5beacc276178cd))

### [1.4.1](https://github.com/simoneb/axios-hooks/compare/v1.3.0...v1.4.1) (2019-10-19)


### Bug Fixes

* do not execute manual requests on server ([88829b0](https://github.com/simoneb/axios-hooks/commit/88829b0206673f411367eae67b018dae0c48b059))

## [1.4.0](https://github.com/simoneb/axios-hooks/compare/v1.3.0...v1.4.0) (2019-10-12)

Features

- Add useCache option

## [1.3.0](https://github.com/simoneb/axios-hooks/compare/v1.2.1...v1.3.0) (2019-08-05)

### [1.2.1](https://github.com/simoneb/axios-hooks/compare/v1.2.0...v1.2.1) (2019-07-21)

## [1.2.0](https://github.com/simoneb/axios-hooks/compare/v1.1.5...v1.2.0) (2019-07-18)

### Features

- Allow using the cache when triggering requests manually ([1fccd27](https://github.com/simoneb/axios-hooks/commit/1fccd27)), closes [#19](https://github.com/simoneb/axios-hooks/issues/19)

### [1.1.5](https://github.com/simoneb/axios-hooks/compare/v1.1.4...v1.1.5) (2019-07-16)

### [1.1.4](https://github.com/simoneb/axios-hooks/compare/v1.1.3...v1.1.4) (2019-07-14)

### [1.1.3](https://github.com/simoneb/axios-hooks/compare/v1.1.2...v1.1.3) (2019-07-12)

### [1.1.2](https://github.com/simoneb/axios-hooks/compare/v1.1.1...v1.1.2) (2019-06-30)

### [1.1.1](https://github.com/simoneb/axios-hooks/compare/v1.1.0...v1.1.1) (2019-06-30)

### Tests

- Add tests ([a1412a5](https://github.com/simoneb/axios-hooks/commit/a1412a5))

## [1.1.0](https://github.com/simoneb/axios-hooks/compare/v1.0.1...v1.1.0) (2019-05-25)

### Features

- Add manual option to skip automatic execution ([a98fba2](https://github.com/simoneb/axios-hooks/commit/a98fba2)), closes [#6](https://github.com/simoneb/axios-hooks/issues/6)

# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.
