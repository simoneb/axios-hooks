OTP=$(curl https://my-otp.herokuapp.com/api/generate/$MY_OTP_TOKEN)
echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > .npmrc
npm publish --otp $OTP
