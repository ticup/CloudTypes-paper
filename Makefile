REPORTER = spec


test:
	@./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--ui bdd \
		test/*.js


.PHONY: test-all