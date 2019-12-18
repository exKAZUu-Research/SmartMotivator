require 'pp'

Object.class_eval do
  def ppp(*args)
    puts "<" * 4 + caller[0]
    if args.empty?
      pp self
    else
      args.each { |x| pp x }
    end
    puts ">" * 20
    self
  end
end

Enumerable.class_eval do

  #
  # 以下のように振る舞います
  #   ary = [User(1, 'Taro'), User(2, 'Jiro'), User(3, 'Sabro')]
  #   ary.to_hash_by_key(&:id) # => { 1 => User(1, 'Taro'), 2 => User(2, 'Jiro') ... }
  #
  def to_hash_by_key
    hash = {}
    each do |item|
      hash[yield item] = item
    end
    hash
  end
end

ActiveRecord::Base.class_eval do
  def self.t(*args)
    if args.empty?
      model_name.human
    else
      human_attribute_name(*args)
    end
  end

  def t(*args)
    self.class.t(*args)
  end

  def self.to_id(record)
    case record
    when self
      record.__send__(primary_key)
    else
      record
    end
  end
end

ActiveRecord::Migration.class_eval do
  def table_model(table_name, skip_timestamp: false)
    klass = Class.new(ActiveRecord::Base) { self.table_name = table_name }
    klass.record_timestamps = false if skip_timestamp
    yield klass
  ensure
    klass.reset_column_information
  end

  def table_model_each(table_name)
    table_model(table_name) do |t|
      t.find_each do |model|
        yield model
      end
    end
  end
end

ActionDispatch::Routing::Mapper.class_eval do
  alias_method :get_, :get
end

ActionController::Parameters.class_eval do
  def normalize_values
    transform_values do |value|
      case value
      when "true"
        true
      when "false"
        false
      else
        value
      end
    end
  end
end
