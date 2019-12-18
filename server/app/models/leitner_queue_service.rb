module LeitnerQueueService
  QueueRates = ::Struct.new(:learning_rate, :review_rates)

  module_function

  # samples how many quizzes from each leitner box should be taken according
  # to optimal distribution
  def quizzes_per_box(nb_boxes, nb_samples, review_budget = 1, difficulty = 0.01, precision = 1000)
    queue_rates = optimal_rates(nb_boxes, review_budget, difficulty)

    # approximate way of sampling from a discrete non uniform distribution up to a n precision
    # generate n cells in an array, put n * p_i versions of the random variable in the array
    # and sample it uniformly
    sample_rates = queue_rates.values.flatten
    truncated_rates = sample_rates.map &->(x) { (x * precision).truncate }
    truncated_rates_with_index = truncated_rates.zip(0..truncated_rates.length)
    cells = truncated_rates_with_index.reduce([]) do |sum, elem|
      value = elem[0]
      index = elem[1]
      sum + Array.new(value, index)
    end
    sample = nb_samples.times.map { cells.sample }

    # return the total number of samples associated with each Leitner box
    sample.each_with_object(Hash.new(0)) { |index, counts| counts[index] += 1 }
  end

  def optimal_rates(nb_boxes, review_budget, difficulty)
    julia_fpath = Rails.root + 'julia/'
    precomputed_fpath = Rails.root + 'julia/' + 'precomputed' + "#{nb_boxes}-#{review_budget}-#{difficulty}.cache"

    if File.exists?(precomputed_fpath)
      rates_hash = JSON.load(File.read(precomputed_fpath))
    else
      rates_hash =
        JSON.parse(`julia #{julia_fpath}/optimal_rates.jl #{nb_boxes} #{review_budget} #{difficulty}`)
      File.open(precomputed_fpath, "w") do |f|
        f.write(JSON.pretty_generate(rates_hash))
      end
    end
    QueueRates.new(rates_hash["optimalArrivalRate"], rates_hash["optimalWorkRates"])
  end
end
