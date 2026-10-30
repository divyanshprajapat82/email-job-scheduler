const redisConnection = require("../config/redis");

const reserveEmailSlot = async ({
	userId,
	senderId,
	requestedAt,
	delaySeconds = 0,
	hourlyLimit = 0,
	emailId,
}) => {
	const key = `email-rate:${userId}:${senderId}`;

	const script = `
        local key = KEYS[1]

        local requestedAt = tonumber(ARGV[1])
        local delayMs = tonumber(ARGV[2])
        local hourlyLimit = tonumber(ARGV[3])
        local emailId = ARGV[4]
        local currentTime = tonumber(ARGV[5])

        local hourMs = 3600000
        local candidate = math.max(requestedAt, currentTime)

        redis.call(
            "ZREMRANGEBYSCORE",
            key,
            "-inf",
            currentTime - hourMs
        )

        for iteration = 1, 10000 do

            local changed = false

            -- Check previous reservation.
            if delayMs > 0 then
                local previous = redis.call(
                    "ZREVRANGEBYSCORE",
                    key,
                    candidate,
                    "-inf",
                    "WITHSCORES",
                    "LIMIT",
                    0,
                    1
                )

                if #previous > 0 then
                    local previousTime = tonumber(previous[2])

                    if candidate - previousTime < delayMs then
                        candidate = previousTime + delayMs
                        changed = true
                    end
                end
            end

            -- Check next reservation.
            if not changed and delayMs > 0 then
                local nextReservation = redis.call(
                    "ZRANGEBYSCORE",
                    key,
                    "(" .. candidate,
                    "+inf",
                    "WITHSCORES",
                    "LIMIT",
                    0,
                    1
                )

                if #nextReservation > 0 then
                    local nextTime = tonumber(nextReservation[2])

                    if nextTime - candidate < delayMs then
                        candidate = nextTime + delayMs
                        changed = true
                    end
                end
            end

            -- Check rolling one-hour limit.
            if not changed and hourlyLimit > 0 then

                local reservations = redis.call(
                    "ZRANGEBYSCORE",
                    key,
                    "(" .. (candidate - hourMs),
                    candidate,
                    "WITHSCORES"
                )

                local windowStarts = { candidate - 1 }

                for i = 2, #reservations, 2 do
                    local reservationTime = tonumber(reservations[i])

                    if reservationTime < candidate then
                        table.insert(
                            windowStarts,
                            reservationTime - 1
                        )
                    end
                end

                for _, windowStart in ipairs(windowStarts) do

                    local windowEnd = windowStart + hourMs

                    local count = redis.call(
                        "ZCOUNT",
                        key,
                        "(" .. windowStart,
                        windowEnd
                    )

                    if count >= hourlyLimit then
                        candidate = windowEnd + 1
                        changed = true
                        break
                    end
                end
            end

            -- Reserve when all conditions are satisfied.
            if not changed then

                redis.call(
                    "ZADD",
                    key,
                    candidate,
                    emailId
                )

                local ttl = math.max(
                    172800,
                    math.ceil(
                        (candidate - currentTime) / 1000
                    ) + 3600
                )

                redis.call("EXPIRE", key, ttl)

                return candidate
            end
        end

        return redis.error_reply(
            "Unable to find an available email reservation slot"
        )
    `;

	const reservedTimestamp = await redisConnection.eval(
		script,
		1,
		key,
		requestedAt,
		delaySeconds * 1000,
		hourlyLimit,
		emailId,
		Date.now(),
	);

	return Number(reservedTimestamp);
};

const releaseEmailSlot = async ({ userId, senderId, emailId }) => {
	const key = `email-rate:${userId}:${senderId}`;

	await redisConnection.zrem(key, emailId);
};

module.exports = {
	reserveEmailSlot,
	releaseEmailSlot,
};
