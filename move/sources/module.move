module module_addr::raflash {
    use std::error;
    use std::vector;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::signer;
    use aptos_std::math64;
    //use std::string::{Self, String};
    //use aptos_framework::event;
    //use aptos_framework::timestamp;

    use aptos_framework::randomness;

    const ETICKET_COSTS_ONE_APT: u64 = 0; // Ticket cost: 1 APT.
    const ENOT_ENOUGH_PARTICIPANTS: u64 = 1;
    const EFLASHLOAN_NOT_ENOUGH_MONEY: u64 = 2;

    /// STRUCTS
    struct Pool has key {
        fees: u64,
        participants: vector<address>,
        coins : coin::Coin<AptosCoin>,
    }

    struct Ticket has key, drop {
        amount: u64,
    }

    /// Because this struct does not have the key or store ability, it cannot be transferred or otherwise placed in persistent storage.
    /// Because it does not have the drop ability, it cannot be discarded. Thus, the only way to get rid of this struct is to call
    /// repay sometime during the transaction that created it, which is exactly what we want from a flash loan.
    struct Receipt {
        amount: u64,
    }

    // This function will be executed after deployment.
    // Add entry function to initialize through an use (and add parameter if wanted then).
    fun init_module(account: &signer) {
        // Initialize the pool with zero funds and zero earnings.
        move_to(account, Pool {
            fees: 0,
            participants: vector::empty<address>(),
            coins : coin::zero<AptosCoin>(),
        });
    }

    /// POOL
    public entry fun buy_ticket (account: &signer) acquires Pool {
        //assert!(coin::value(&coin) == 1, ETICKET_COSTS_ONE_APT);
        coin::register<AptosCoin>(account);
        let pool = borrow_global_mut<Pool>(@module_addr);
        let coin = coin::withdraw<AptosCoin>(account, 100000000); // This is 1 APT
        coin::merge(&mut pool.coins, coin);
        move_to(account, Ticket {amount : 1}); // add if exist later
        vector::push_back(&mut pool.participants, signer::address_of(account));

    }

    // workaround: don't return ticket and get claim
    public entry fun repay_ticket (account: &signer) acquires Ticket, Pool {
        let ticket = borrow_global_mut<Ticket>(signer::address_of(account));
        ticket.amount = ticket.amount - 1;
        if (ticket.amount == 0) {
            move_from<Ticket>(signer::address_of(account));
        };
        let pool = borrow_global_mut<Pool>(@module_addr);
        let coin = coin::extract(&mut pool.coins, 100000000);
        coin::deposit(signer::address_of(account), coin);
        vector::remove_value(&mut pool.participants, &signer::address_of(account));
    }

    // Pick a raffle winner and transfer the fees.
    #[randomness]
    entry fun draw(account: &signer) acquires Pool {
        let pool = borrow_global_mut<Pool>(signer::address_of(account));
        let num_participants = vector::length(&pool.participants);
        assert!(num_participants > 0, EFLASHLOAN_NOT_ENOUGH_MONEY);

        let winner_index = randomness::u8_range(0, (num_participants as u8));
        let winner = *vector::borrow(&pool.participants, (winner_index as u64));

        let pool = borrow_global_mut<Pool>(@module_addr);
        pool.fees = 0;
        let reward = coin::extract(&mut pool.coins, pool.fees);
        coin::deposit(winner, reward);
    }

    /// FLASH LOAN
    public fun flashloan<AptosCoin>(amount: u64) : (coin::Coin<aptos_framework::aptos_coin::AptosCoin>, Receipt) acquires Pool {
        let pool = borrow_global_mut<Pool>(@module_addr);
        let coin = coin::extract(&mut pool.coins, amount);
        let receipt = Receipt {  amount: amount + math64::mul_div(amount, 1, 100)}; // 1% fee

        (coin, receipt)
    }

    public fun flashrepay<AptosCoin>(coin: coin::Coin<aptos_framework::aptos_coin::AptosCoin>, receipt: Receipt) acquires Pool {
        let Receipt { amount } = receipt;
        assert!(
            coin::value(&coin) >= amount,
            error::invalid_argument(EFLASHLOAN_NOT_ENOUGH_MONEY)
        );

        let pool = borrow_global_mut<Pool>(@module_addr);
        coin::merge(&mut pool.coins, coin);
    }

    public entry fun try_flash(amount: u64) acquires Pool {
        let (coins, receipt) = flashloan<AptosCoin>(amount);
        flashrepay<AptosCoin>(coins, receipt);
    }

    #[view]
    /// Get Pool amount
    public fun pool_amount(): u64 acquires Pool {
        let pool = borrow_global<Pool>(@module_addr);
        coin::value(&pool.coins)
    }
}
