export const createTIM = window.TIMC // for bot

export default createTIM() // as original TIM, for user

delete window.TIMC

window.genTestUserSig = (userID, SDKAPPID, SECRETKEY) => {
  /**
   * 签名过期时间，建议不要设置的过短
   * <p>
   * 时间单位：秒
   * 默认时间：7 x 24 x 60 x 60 = 604800 = 7 天
   */
  const EXPIRETIME = 604800

  const generator = new window.LibGenerateTestUserSig(SDKAPPID, SECRETKEY, EXPIRETIME)
  const userSig = generator.genTestUserSig(userID)
  return {
    SDKAppID: SDKAPPID,
    userSig: userSig
  }
}