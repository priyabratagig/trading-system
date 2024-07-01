class Datetime {
    static isValid(date) {
        date = date instanceof Date ? date : new Date(date)
        return !isNaN(date.getHours())
    }

    static To_String(datetime) {
        datetime = datetime || Datetime.Now()
        if (!Datetime.isValid(datetime)) throw new Error(`To_String : Datetime invalid, ${datetime}`)

        const time_component = datetime.toString().split(' GMT')[0]

        return `${time_component} GMT+0530 (Indian Standard Time)`
    }

    static Now() {
        const sys_datetime = new Date()
        const timezone_offset = sys_datetime.getTimezoneOffset()
        const ist_offset = 330
        const ist_datetime = new Date(sys_datetime.getTime() + (ist_offset + timezone_offset) * 60 * 1000)

        return ist_datetime
    }

    static DateNum_Today() {
        const today = Datetime.Now()
        let month = today.getMonth() + 1
        let day = today.getDate()
        month = month.toString().padStart(2, '0')
        day = day.toString().padStart(2, '0')
        const date = parseInt(`${today.getFullYear()}${month}${day}0000`, 10)

        return date
    }

    static TimeNum_Now() {
        const now = Datetime.Now()
        let hours = now.getHours()
        let minutes = now.getMinutes()
        hours = hours.toString().padStart(2, '0')
        minutes = minutes.toString().padStart(2, '0')
        const time = parseInt(`${hours}${minutes}`, 10)

        return time
    }

    static Datetime_To_EPOCH(datetime) {
        const now = datetime instanceof Date ?
            new Date(datetime) :
            isNaN(datetime) ?
                Datetime.Now() :
                Datetime.Datetime_From_DateTimeNum(parseInt(datetime, 10))
        if (!Datetime.isValid(now)) throw new Error(`Datetime_To_EPOCH : Datetime invalid, ${datetime}`)

        const year = datetime.getFullYear()
        const month = datetime.getMonth()
        const date_ = datetime.getDate()
        const hour = datetime.getHours()
        const minute = datetime.getMinutes()
        const second = 0
        const miliseconds = 0

        const utc_date = new Date(Date.UTC(year, month, date_, hour - 5, minute - 30, second, miliseconds))
        const epoch_time = Math.floor(utc_date.getTime() / 1000)

        return epoch_time
    }

    static Timestamp(datetime) {
        const now = datetime instanceof Date ?
            new Date(datetime) :
            isNaN(datetime) ?
                Datetime.Now() :
                Datetime.Datetime_From_DateTimeNum(parseInt(datetime, 10))
        if (!Datetime.isValid(now)) throw new Error(`Timestamp : Datetime invalid, ${datetime}`)

        const year = datetime.getFullYear()
        let month = String(datetime.getMonth() + 1).padStart(2, '0')
        const day = String(datetime.getDate()).padStart(2, '0')
        const hours = datetime.getHours().toString().padStart(2, '0')
        const minutes = String(datetime.getMinutes()).padStart(2, '0')
        const seconds = String(datetime.getSeconds()).padStart(2, '0')

        const date_string = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
        return date_string
    }

    static DateNum_From_Date(date) {
        if (!Datetime.isValid(date)) throw new Error(`DateNum_From_Date : Date invalid, ${date}`)
        date = new Date(date)

        let month = date.getMonth() + 1
        let day = date.getDate()
        month = month.toString().padStart(2, '0')
        day = day.toString().padStart(2, '0')
        date = parseInt(`${date.getFullYear()}${month}${day}0000`, 10)

        return date
    }

    static TimeNum_From_Time(time) {
        if (!Datetime.isValid(time)) throw new Error(`TimeNum_From_Time : Time invalid, ${time}`)
        time = new Date(time)

        let hours = time.getHours()
        let minutes = time.getMinutes()
        hours = hours.toString().padStart(2, '0')
        minutes = minutes.toString().padStart(2, '0')
        time = parseInt(`${hours}${minutes}`, 10)

        return time
    }

    static TimeNum_From_12H(time) {
        const time_reg = /^(\d+):(\d+)\s*(am|pm)$/i
        const match = time_reg.exec(time)
        if (!match) throw Error(`TimeNum_From_12H : Time invalid, ${time}`)

        let [, hours, minutes, period] = match
        hours = period.toLowerCase() == 'am' || hours == 12 ? +hours : 12 + +hours

        time = Datetime.Now()
        time.setHours(+hours)
        time.setMinutes(+minutes)

        return Datetime.TimeNum_From_Time(time)
    }

    static Datetime_From_DateTimeNum(datetime) {
        const datetiem_reg = /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2}){0,1}/
        const match = datetiem_reg.exec(datetime)
        if (!match) throw new Error(`Datetime_From_DateTimeNum : Datetime number invalid, ${datetime}`)

        const [, year, month, day, hours, minutes, seconds] = match

        return new Date(year, month - 1, day, hours, minutes, seconds || 0)
    }

    static Get_Pervious_N_15Min_Time({ n = 1, time } = {}) {
        n = n <= 1 ? 1 : +n
        const now = time instanceof Date ?
            new Date(time) :
            isNaN(time) ?
                Datetime.Now() :
                Datetime.Datetime_From_DateTimeNum(parseInt(time, 10))
        if (!Datetime.isValid(now)) throw new Error(`Get_Pervious_N_15Min_Time : Time invalid, ${time}`)

        const minutes = now.getMinutes()
        const remainder = minutes % 15
        const minutes_to_subtract = remainder === 0 ? 0 : remainder

        const previous_time = new Date(now)
        previous_time.setMinutes(minutes - minutes_to_subtract)
        previous_time.setSeconds(0)
        previous_time.setMilliseconds(0)

        const pervious_times = Array(n).fill(null).map((_, idx) => {
            const time = new Date(previous_time)
            const minute = time.getMinutes()
            time.setMinutes(minute - 15 * idx)
            time.setSeconds(0)
            time.setMilliseconds(0)

            return time
        })

        return pervious_times
    }

    static Get_Next_N_15Min_Time({ n = 1, time } = {}) {
        n = n <= 1 ? 1 : +n
        const now = time instanceof Date ?
            new Date(time) :
            isNaN(time) ?
                Datetime.Now() :
                Datetime.Datetime_From_DateTimeNum(parseInt(time, 10))
        if (!Datetime.isValid(now)) throw new Error(`Get_Next_N_15Min_Time : Time invalid, ${time}`)

        const minutes = now.getMinutes()
        const remainder = minutes % 15
        const minutes_to_add = remainder === 0 ? 15 : 15 - remainder

        const next_time = new Date(now)
        next_time.setMinutes(minutes + minutes_to_add)
        next_time.setSeconds(0)
        next_time.setMilliseconds(0)

        const next_times = Array(n).fill(null).map((_, idx) => {
            const time = new Date(next_time)
            time.setMinutes(time.getMinutes() + 15 * idx)
            time.setSeconds(0)
            time.setMilliseconds(0)

            return time
        })

        return next_times
    }

    static Get_Previous_N_Dates({ n = 1, date } = {}) {
        n = n <= 1 ? 1 : +n
        const now = date instanceof Date ?
            new Date(date) :
            isNaN(date) ?
                Datetime.Now() :
                Datetime.Datetime_From_DateTimeNum(parseInt(date, 10))
        if (!Datetime.isValid(now)) throw new Error(`Get_Previous_N_Dates : Date invalid, ${date}`)

        const previous_dates = Array(n).fill(null).map((_, idx) => {
            const previous_date = new Date(now)
            previous_date.setDate(now.getDate() - idx)
            previous_date.setHours(0, 0, 0, 0)
            return previous_date
        })

        return previous_dates
    }

    static Get_Next_N_Dates({ n = 1, date } = {}) {
        n = n <= 1 ? 1 : +n
        const now = date instanceof Date ?
            new Date(date) :
            isNaN(date) ?
                Datetime.Now() :
                Datetime.Datetime_From_DateTimeNum(parseInt(date, 10))
        if (!Datetime.isValid(now)) throw new Error(`Get_Next_N_Dates : Date invalid, ${date}`)

        const next_dates = Array(n).fill(null).map((_, idx) => {
            const next_date = new Date(now)
            next_date.setDate(now.getDate() + (idx + 1))
            next_date.setHours(0, 0, 0, 0)
            return next_date
        });

        return next_dates
    }

    static Get_Time_Diff_MS(date1, date2) {
        date1 = date1 instanceof Date ? new Date(date1) : Datetime.Datetime_From_DateTimeNum(+date1)
        date2 = date2 instanceof Date ? new Date(date2) : Datetime.Datetime_From_DateTimeNum(+date2)

        if (!Datetime.isValid(date1)) throw new Error(`Get_Time_Diff_MS : Datetime invalid, ${date1}`)
        if (!Datetime.isValid(date2)) throw new Error(`Get_Time_Diff_MS : Datetime invalid, ${date2}`)

        const diff = date2.getTime() - date1.getTime()

        return Math.abs(diff)
    }
}

module.exports = Datetime