import * as colors from '../src/colors.js'

test('colors', () => {
	expect(colors).toMatchSnapshot()
})
