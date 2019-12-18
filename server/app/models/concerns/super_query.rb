module SuperQuery
  extend ActiveSupport::Concern

  class_methods do
    def find_by_ids(ids)
      hash = where(id: ids).each_with_object({}) { |u, h| h[u.id] = u }
      ids.map { |id| hash[id] }
    end

    def x_select(*args, **rest)
      # columns = args.map(&:to_s)
      scope = self
      if rest.present?
        t = arel_table
        rest.each do |k, v|
          vs = Array.wrap(v)
          case k
          when :sum
            coalesce = ->(a, b) { Arel::Nodes::NamedFunction.new('COALESCE', [a, b]) }
            args.concat(vs.map { |column| coalesce[t[column].sum, 0].as(column.to_s) })
          when :max
            args.concat(vs.map { |column| t[column].maximum.as(column.to_s) })
          when :group
            scope = scope.group(*vs)
            args.concat(vs)
          else
            raise "Not supported aggregation: #{k}"
          end
        end
      end
      scope.select(*args)
    end
  end
end
