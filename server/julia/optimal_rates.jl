#=
Script for computing the optimal rates of review in a leitner queue network
See https://github.com/rddy/leitnerq for more information

Usage: optimal_rates.jl nb_decks review_budget difficulty
=#
using ArgParse
using JSON

include("spp.jl")

function parse_commandline()
    s = ArgParseSettings()

    @add_arg_table s begin
        "nbdecks"
            help = "The total number of decks in the Leitner system"
            arg_type = Int64
            required = true
        "review_budget"
            help = "The review budget of the user"
            arg_type = Int64
            required = true
        "difficulty"
            help = "The global difficulty associated with the user"
            arg_type = Float64
            required = true
    end

    return parse_args(s)
end

function main()
    parsed_args = parse_commandline()

    nbdecks = parsed_args["nbdecks"]
    review_budget = parsed_args["review_budget"]
    difficulty = parsed_args["difficulty"]

    opt_arrival_rate, opt_work_rates =
        allocate_work_rates(nbdecks, review_budget, difficulty)

    JSON.print(STDOUT,
                Dict("optimalArrivalRate"=>opt_arrival_rate,
                     "optimalWorkRates"=>opt_work_rates))
    
end

main()
