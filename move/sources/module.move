module module_addr::raflash {
    use std::vector;
    use aptos_std::math64;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::signer;
    //use std::string::{Self, String};
    //use aptos_framework::event;
    //use aptos_framework::timestamp;
    //use std::error;
    //use aptos_framework::fixed_point64;

    use aptos_framework::randomness;

    use aptos_framework::event;

    const ENOT_ENOUGH_PARTICIPANTS: u64 = 0;
    const EFLASHLOAN_NOT_ENOUGH_MONEY: u64 = 1;

    /// STRUCTS
    /// We want users to buy tickets with AptosCoin (APT) because it's more useful for flash loans.
    struct Pool has key {
        fees: u64,
        participants: vector<address>,
        coins : coin::Coin<AptosCoin>,
    }

    struct Ticket has key, drop {
        amount: u64,
    }

    /// SECRET BEHIND FLASH LOAN:
    /// Receipt does not have the key or store ability, it cannot be transferred or otherwise placed in persistent storage.
    /// Does not have the drop ability, it cannot be discarded.
    /// Only way to get rid of this struct is to call repay.
    struct Receipt {
        amount: u64,
        fees: u64,
    }

    // EVENTS

    #[event]
    struct TicketBoughtEvent has drop, store {
        buyer: address,
        amount: u64,
    }

    #[event]
    struct TicketRepaidEvent has drop, store {
        buyer: address,
        amount: u64,
    }

    #[event]
    struct DrawEvent has drop, store {
        winner: address,
        reward: u64,
    }

    #[event]
    struct FlashloanEvent has drop, store {
        borrower: address,
        amount: u64,
        fees: u64,
    }

    /// This function will be executed just after deployment.
    /// Or else add entry function to initialize with parameters.
    fun init_module(account: &signer) {
        // Initialize the pool with zero funds and zero earnings.
        move_to(account, Pool {
            fees: 0,
            participants: vector::empty<address>(),
            coins : coin::zero<AptosCoin>(),
        });
    }

    /// POOL
    public entry fun buy_ticket (account: &signer) acquires Pool, Ticket{
        coin::register<AptosCoin>(account);
        let pool = borrow_global_mut<Pool>(@module_addr);
        let coin = coin::withdraw<AptosCoin>(account, 100000000); // Because APT because 8 decimals
        coin::merge(&mut pool.coins, coin);

        if (exists<Ticket>(signer::address_of(account))) {
            let ticket = borrow_global_mut<Ticket>(signer::address_of(account));
            ticket.amount = ticket.amount + 1;

        } else {
            move_to(account, Ticket {amount : 1});
        };
        vector::push_back(&mut pool.participants, signer::address_of(account));

        // Emit Ticket Bought Event
        event::emit_event(TicketBoughtEvent {
            buyer: signer::address_of(account),
            amount: 1,
        });
    }

    public entry fun repay_ticket (account: &signer) acquires Ticket, Pool {
        let ticket = borrow_global_mut<Ticket>(signer::address_of(account));
        ticket.amount = ticket.amount - 1;
        if (ticket.amount == 0) {
            move_from<Ticket>(signer::address_of(account));
        };
        let pool = borrow_global_mut<Pool>(@module_addr);
        let coin = coin::extract(&mut pool.coins, 100000000); // This is 1 APT (Ticket price)
        coin::deposit(signer::address_of(account), coin);
        vector::remove_value(&mut pool.participants, &signer::address_of(account));

        // Emit Ticket Repaid Event
        event::emit_event(TicketRepaidEvent {
            buyer: signer::address_of(account),
            amount: 1,
        });
    }

    #[randomness]
    /// Pick a raffle winner and transfer the fees.
    entry fun draw() acquires Pool {
        let pool = borrow_global_mut<Pool>(@module_addr);
        let num_participants = vector::length(&pool.participants);
        assert!(num_participants > 0, ENOT_ENOUGH_PARTICIPANTS);

        let winner_index = randomness::u8_range(0, (num_participants as u8));
        let winner = *vector::borrow(&pool.participants, (winner_index as u64));

        let reward = coin::extract(&mut pool.coins, 1000000);
        coin::deposit(winner, reward);
        pool.fees = 0;

        // Emit Event for winner
        event::emit_event(DrawEvent {
            winner: winner,
            reward: reward,
        });
    }

    public entry fun donate (account: &signer, amount: u64) acquires Pool {
        coin::register<AptosCoin>(account);
        let pool = borrow_global_mut<Pool>(@module_addr);
        let coin = coin::withdraw<AptosCoin>(account, amount * 100000000);
        pool.fees = pool.fees + amount * 100000000;
        coin::merge(&mut pool.coins, coin);

    }

    /// FLASH LOAN
    public fun flashloan(account: &signer, amount: u64) : Receipt acquires Pool {
        let pool = borrow_global_mut<Pool>(@module_addr);
        let coin = coin::extract(&mut pool.coins, amount);
        let receipt = Receipt {  amount, fees: math64::mul_div(amount, 1, 100)}; // 1% fee

        coin::deposit(signer::address_of(account), coin);

        // Emit Flashloan Event
        event::emit_event(FlashloanEvent {
            borrower: signer::address_of(account),
            amount: amount,
            fees: receipt.fees,
        });

        receipt
    }

    public fun flashrepay (account: &signer, receipt: Receipt) acquires Pool {
        coin::register<AptosCoin>(account);
        let Receipt { amount, fees } = receipt;
        let coin = coin::withdraw<AptosCoin>(account, amount + 1000000);

        let pool = borrow_global_mut<Pool>(@module_addr);
        coin::merge(&mut pool.coins, coin);
        pool.fees = pool.fees + 100000000;
    }

    public entry fun try_flash(account: &signer, amount: u64) acquires Pool {
        let receipt = flashloan(account, amount);
        flashrepay(account, receipt);
    }

    #[view]
    /// Get Pool amount
    public fun pool_amount(): u64 acquires Pool {
        let pool = borrow_global<Pool>(@module_addr);
        coin::value(&pool.coins)
    }
}
