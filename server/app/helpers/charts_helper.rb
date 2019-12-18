module ChartsHelper
  def create_dates(start_time, end_time, grouping)
    dates = []
    amount_dates = (end_time.to_date - start_time.to_date).to_i + 1
    group_last = amount_dates % (grouping)
    (start_time.to_date .. end_time.to_date).each_with_index do |date, index|
      if grouping == 1
        dates << date.to_s
      elsif index == 0 && group_last != 0
        dates << date.to_s + " - " + (date + group_last.days - 1.days).to_s
      elsif (amount_dates - index) % grouping == 0
        dates << date.to_s + " - " + (date + grouping.days - 1.days).to_s
      end
    end
    return dates
  end

  def group_hash(start_time, end_time, grouping, hash, type)
    grouped_hash = Hash.new { |h, k| h[k] = [] } if type == "array"
    grouped_hash = Hash.new { |h, k| h[k] = 0 } if type == "numeric"
    amount_dates = (end_time.to_date - start_time.to_date).to_i + 1
    group_last = amount_dates % (grouping)
    key = ""
    (start_time.to_date..end_time.to_date).each_with_index do | date, index |
      if index == 0 && group_last != 0
        key = date.to_s + " - " + (date + group_last.days - 1.days).to_s
      elsif (amount_dates - index) % grouping == 0
        key = date.to_s + " - " + (date + grouping.days - 1.days).to_s
      end
      if type == "array"
        hash[date.to_s].each { | value | grouped_hash[key] << value }
        grouped_hash[key].uniq! if index == group_last || index % grouping == grouping - 1
      end
      if type == "numeric"
        grouped_hash[key] = grouped_hash[key] + hash[date.to_s]
      end
    end
    return grouped_hash
  end

  def create_chart_data(x, y, y_type)
    # Create arrays for charts
    x_result = []
    y_result = Array.new(y.size) { Array.new(x.size, 0) }
    x.each_with_index do | x_value, index|
      x_str = x_value.to_s
      x_result << x_str
      y.each_with_index do | y_hash, i |
        y_result[i][index] = y_hash[x_str].count if (y_hash.has_key? x_str) && (y_type == "array")
        y_result[i][index] = y_hash[x_str] if (y_hash.has_key? x_str) && (y_type == "numeric")
      end
    end
    return x_result, y_result
  end
end
