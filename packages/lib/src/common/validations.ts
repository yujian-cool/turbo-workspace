export const isPhone = (phone: string) => {
    return /^1[3456789]\d{9}$/.test(phone)
}

export const isEmail = (email: string) => {
    return /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/.test(email)
}

export const isIdCard = (idCard: string) => {
    return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(idCard)
}

export const isBankCard = (bankCard: string) => {
    return /^([1-9]{1})(\d{14}|\d{18})$/.test(bankCard)
}

export const isPassword = (password: string) => {
    // 6-20位数字和字母组合
    return /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,20}$/.test(password)
}

export const isLink = (link: string) => {
    return /^(((ht|f)tps?):\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/.test(link)
}
